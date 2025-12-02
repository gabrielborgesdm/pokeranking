import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection, ClientSession } from 'mongoose';
import { Box } from './schemas/box.schema';
import { User } from '../users/schemas/user.schema';
import { CreateBoxDto } from './dto/create-box.dto';
import { UpdateBoxDto } from './dto/update-box.dto';
import { CommunityBoxQueryDto } from './dto/community-box-query.dto';
import { BoxResponseDto } from './dto/box-response.dto';
import { stripUndefined } from '../common/utils/transform.util';
import { PokemonService } from '../pokemon/pokemon.service';
import { withTransaction } from '../common/utils/transaction.util';

@Injectable()
export class BoxesService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(Box.name) private readonly boxModel: Model<Box>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly pokemonService: PokemonService,
  ) {}

  async create(userId: string, createBoxDto: CreateBoxDto): Promise<Box> {
    return withTransaction(this.connection, async (session) => {
      // Validate unique box name per user
      await this.validateUniqueNamePerUser(
        userId,
        createBoxDto.name,
        undefined,
        session,
      );

      // Get user's username for denormalization
      const user = await this.userModel
        .findById(userId)
        .session(session)
        .exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const box = new this.boxModel({
        ...createBoxDto,
        user: new Types.ObjectId(userId),
        ownerUsername: user.username,
      });

      const savedBox = await box.save({ session });

      // Add box to user's boxes array
      await this.userModel.findByIdAndUpdate(
        userId,
        { $push: { boxes: savedBox._id } },
        { session },
      );

      return savedBox;
    });
  }

  async findAllByUser(userId: string): Promise<(Box | BoxResponseDto)[]> {
    // Fetch all user's owned boxes
    const boxes = await this.boxModel
      .find({ user: new Types.ObjectId(userId) })
      .populate('pokemon')
      .sort({ createdAt: -1 })
      .exec();

    // Create default virtual box
    const defaultBox = await this.createDefaultBox();

    // Return merged array: [defaultBox, ...boxes]
    return [defaultBox, ...boxes];
  }

  async findCommunityBoxes(
    userId: string,
    query: CommunityBoxQueryDto,
  ): Promise<{ boxes: Box[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
      search,
      ownerUsername,
    } = query;
    // Build query: public boxes not owned by user
    const baseQuery: Record<string, unknown> = {
      isPublic: true,
      user: { $ne: new Types.ObjectId(userId) },
    };

    // Apply ownerUsername filter first (more selective)
    if (ownerUsername) {
      baseQuery.ownerUsername = ownerUsername;
    }

    // Apply search filter
    if (search) {
      baseQuery.name = { $regex: search, $options: 'i' };
    }

    // Get total count
    const total = await this.boxModel.countDocuments(baseQuery).exec();

    // Get paginated results
    const boxes = await this.boxModel
      .find(baseQuery)
      .populate('pokemon')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<Box[]>()
      .exec();

    return { boxes, total };
  }

  async findOne(id: string, userId: string): Promise<Box | BoxResponseDto> {
    // Handle default box
    if (id === 'default') {
      return await this.createDefaultBox();
    }

    const box = await this.boxModel
      .findById(id)
      .populate('pokemon')
      .lean<Box>()
      .exec();

    if (!box) {
      throw new NotFoundException(`Box with ID ${id} not found`);
    }

    // Validate access (owner OR isPublic)
    this.validateAccess(box, userId);

    return box;
  }

  async update(
    id: string,
    userId: string,
    updateBoxDto: UpdateBoxDto,
  ): Promise<Box> {
    const box = await this.boxModel.findById(id).exec();

    if (!box) {
      throw new NotFoundException(`Box with ID ${id} not found`);
    }

    // Check ownership
    this.validateOwnership(box, userId);

    // Validate unique name if changing
    if (updateBoxDto.name && updateBoxDto.name !== box.name) {
      await this.validateUniqueNamePerUser(userId, updateBoxDto.name, id);
    }

    // Apply updates
    const updatedData = stripUndefined(updateBoxDto);
    Object.assign(box, updatedData);
    return await box.save();
  }

  async remove(id: string, userId: string): Promise<Box> {
    return withTransaction(this.connection, async (session) => {
      const box = await this.boxModel.findById(id).session(session).exec();

      if (!box) {
        throw new NotFoundException(`Box with ID ${id} not found`);
      }

      // Check ownership
      this.validateOwnership(box, userId);

      await box.deleteOne({ session });

      // Remove box from user's boxes array
      await this.userModel.findByIdAndUpdate(
        userId,
        { $pull: { boxes: box._id } },
        { session },
      );

      return box;
    });
  }

  async favoriteBox(boxId: string, userId: string): Promise<Box> {
    return withTransaction(this.connection, async (session) => {
      // Fetch original box
      const originalBox = await this.boxModel
        .findById(boxId)
        .session(session)
        .exec();

      if (!originalBox || !originalBox.isPublic) {
        throw new NotFoundException(`Box with ID ${boxId} not found`);
      }

      // Validate: user doesn't own it
      if (originalBox.user.toString() === userId) {
        throw new ForbiddenException('Cannot favorite your own box');
      }

      // Get user's username for denormalization
      const user = await this.userModel
        .findById(userId)
        .session(session)
        .exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Generate unique name for copy
      const uniqueName = await this.generateUniqueName(
        userId,
        originalBox.name,
        session,
      );

      // Create NEW box document (copy)
      const copiedBox = new this.boxModel({
        name: uniqueName,
        pokemon: originalBox.pokemon, // Clone pokemon array
        user: new Types.ObjectId(userId),
        ownerUsername: user.username,
        isPublic: false, // User's private copy by default
      });

      const savedBox = await copiedBox.save({ session });

      // Add new box to user's boxes array
      await this.userModel.findByIdAndUpdate(
        userId,
        { $push: { boxes: savedBox._id } },
        { session },
      );

      // Increment original box's favoriteCount
      await this.boxModel.findByIdAndUpdate(
        boxId,
        { $inc: { favoriteCount: 1 } },
        { session },
      );

      return savedBox;
    });
  }

  // Helper: Validate ownership
  private validateOwnership(box: Box, userId: string): void {
    if (box.user.toString() !== userId) {
      throw new ForbiddenException('You can only modify your own boxes');
    }
  }

  // Helper: Validate access (owner OR public)
  private validateAccess(box: Box, userId: string): void {
    const isOwner = box.user.toString() === userId;
    const isPublic = box.isPublic;

    if (!isOwner && !isPublic) {
      throw new NotFoundException(`Box with ID ${box.id} not found`);
    }
  }

  // Helper: Validate unique name per user
  private async validateUniqueNamePerUser(
    userId: string,
    name: string,
    excludeId?: string,
    session: ClientSession | null = null,
  ): Promise<void> {
    const query: Record<string, unknown> = {
      user: new Types.ObjectId(userId),
      name: name,
    };

    // Exclude current box when updating
    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const existing = await this.boxModel.findOne(query).session(session).exec();

    if (existing) {
      throw new ConflictException(`You already have a box with name "${name}"`);
    }
  }

  // Helper: Create default virtual box
  private async createDefaultBox(): Promise<BoxResponseDto> {
    const allPokemon = await this.pokemonService.findAll();

    const defaultBox: BoxResponseDto = {
      _id: 'default',
      name: 'All Pokemon',
      isPublic: false,
      pokemon: allPokemon,
      favoriteCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return defaultBox;
  }

  // Helper: Generate unique name with (2), (3), etc.
  private async generateUniqueName(
    userId: string,
    baseName: string,
    session: ClientSession | null = null,
  ): Promise<string> {
    // Check if base name is available
    const baseExists = await this.boxModel
      .findOne({
        user: new Types.ObjectId(userId),
        name: baseName,
      })
      .session(session)
      .exec();

    if (!baseExists) {
      return baseName;
    }

    // Try baseName (2), baseName (3), etc.
    let counter = 2;
    while (true) {
      const candidateName = `${baseName} (${counter})`;
      const exists = await this.boxModel
        .findOne({
          user: new Types.ObjectId(userId),
          name: candidateName,
        })
        .session(session)
        .exec();

      if (!exists) {
        return candidateName;
      }

      counter++;

      // Safety check to prevent infinite loop
      if (counter > 100) {
        throw new ConflictException(
          'Unable to generate unique name for favorited box',
        );
      }
    }
  }
}
