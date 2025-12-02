import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection, ClientSession } from 'mongoose';
import { Ranking } from './schemas/ranking.schema';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingDto } from './dto/update-ranking.dto';
import { stripUndefined } from '../common/utils/transform.util';
import { Zone } from './schemas/ranking.schema';
import { User } from '../users/schemas/user.schema';
import { withTransaction } from '../common/utils/transaction.util';

@Injectable()
export class RankingsService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(Ranking.name) private readonly rankingModel: Model<Ranking>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(
    userId: string,
    createRankingDto: CreateRankingDto,
  ): Promise<Ranking> {
    return withTransaction(this.connection, async (session) => {
      // Validate unique title per user
      await this.validateUniqueTitle(
        userId,
        createRankingDto.title,
        undefined,
        session,
      );

      // Validate zone intervals if zones provided
      if (createRankingDto.zones && createRankingDto.zones.length > 0) {
        const pokemonCount = createRankingDto.pokemon?.length || 0;
        this.validateZoneIntervals(createRankingDto.zones, pokemonCount);
      }

      const ranking = new this.rankingModel({
        ...createRankingDto,
        user: new Types.ObjectId(userId),
      });

      const savedRanking = await ranking.save({ session });

      // Add ranking to user's rankings array
      await this.userModel.findByIdAndUpdate(
        userId,
        { $push: { rankings: savedRanking._id } },
        { session },
      );

      return savedRanking;
    });
  }

  async update(
    id: string,
    userId: string,
    updateRankingDto: UpdateRankingDto,
  ): Promise<Ranking> {
    const ranking = await this.rankingModel.findById(id).exec();

    if (!ranking) {
      throw new NotFoundException(`Ranking with ID ${id} not found`);
    }

    // Check ownership
    this.validateOwnership(ranking, userId);

    // Validate unique title if title is being updated
    if (updateRankingDto.title && updateRankingDto.title !== ranking.title) {
      await this.validateUniqueTitle(userId, updateRankingDto.title, id);
    }

    // Apply updates to get new values
    const updatedData = stripUndefined(updateRankingDto);
    const newZones = updatedData.zones || ranking.zones;
    const newPokemon = updatedData.pokemon || ranking.pokemon;

    // Validate zone intervals with new data
    if (newZones && newZones.length > 0) {
      this.validateZoneIntervals(newZones, newPokemon.length);
    }

    // Apply updates
    Object.assign(ranking, updatedData);
    return await ranking.save();
  }

  async remove(id: string, userId: string): Promise<Ranking> {
    return withTransaction(this.connection, async (session) => {
      const ranking = await this.rankingModel
        .findById(id)
        .session(session)
        .exec();

      if (!ranking) {
        throw new NotFoundException(`Ranking with ID ${id} not found`);
      }

      // Check ownership
      this.validateOwnership(ranking, userId);

      await ranking.deleteOne({ session });

      // Remove ranking from user's rankings array
      await this.userModel.findByIdAndUpdate(
        userId,
        { $pull: { rankings: ranking._id } },
        { session },
      );

      return ranking;
    });
  }

  // Helper: Validate ownership
  private validateOwnership(ranking: Ranking, userId: string): void {
    if (ranking.user.toString() !== userId) {
      throw new ForbiddenException('You can only modify your own rankings');
    }
  }

  // Helper: Validate unique title per user
  private async validateUniqueTitle(
    userId: string,
    title: string,
    excludeId?: string,
    session: ClientSession | null = null,
  ): Promise<void> {
    const query: {
      user: Types.ObjectId;
      title: string;
      _id?: { $ne: Types.ObjectId };
    } = {
      user: new Types.ObjectId(userId),
      title: title,
    };

    // Exclude current ranking when updating
    if (excludeId) {
      query._id = { $ne: new Types.ObjectId(excludeId) };
    }

    const existing = await this.rankingModel
      .findOne(query)
      .session(session)
      .exec();

    if (existing) {
      throw new ConflictException(
        `You already have a ranking with title "${title}"`,
      );
    }
  }

  // Helper: Validate zone intervals don't exceed pokemon count
  private validateZoneIntervals(zones: Zone[], pokemonCount: number): void {
    for (const zone of zones) {
      const [, end] = zone.interval;

      if (end > pokemonCount) {
        throw new BadRequestException(
          `Zone "${zone.name}" interval [${zone.interval[0]}, ${end}] exceeds pokemon count (${pokemonCount})`,
        );
      }
    }
  }
}
