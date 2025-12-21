import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { TK } from '../i18n/constants/translation-keys';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { Ranking } from './schemas/ranking.schema';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingDto } from './dto/update-ranking.dto';
import { stripUndefined } from '../common/utils/transform.util';
import { User } from '../users/schemas/user.schema';
import { Pokemon } from '../pokemon/schemas/pokemon.schema';
import { withTransaction } from '../common/utils/transaction.util';
import { UsersService } from '../users/users.service';
import { isThemeAvailable } from '@pokeranking/shared';

@Injectable()
export class RankingsService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(Ranking.name) private readonly rankingModel: Model<Ranking>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  async create(
    userId: string,
    createRankingDto: CreateRankingDto,
  ): Promise<Ranking> {
    // Fetch user with populated rankings (only title needed)
    const user = await this.userModel
      .findById(userId)
      .populate<{ rankings: Ranking[] }>('rankings', 'title')
      .exec();

    if (!user) {
      throw new NotFoundException({
        key: TK.USERS.NOT_FOUND,
        args: { id: userId },
      });
    }

    const savedRanking = await withTransaction(
      this.connection,
      async (session) => {
        // Generate unique title from existing rankings
        const uniqueTitle = this.generateUniqueTitle(
          user.rankings,
          createRankingDto.title,
        );

        // Validate theme availability if theme provided
        if (createRankingDto.theme) {
          const pokemonCount = createRankingDto.pokemon?.length || 0;
          const totalPokemon = await this.getTotalPokemonCount();
          this.validateThemeAvailability(
            createRankingDto.theme,
            pokemonCount,
            totalPokemon,
          );
        }

        const ranking = new this.rankingModel({
          ...createRankingDto,
          title: uniqueTitle,
          user: new Types.ObjectId(userId),
        });

        const saved = await ranking.save({ session });

        // Add ranking to user's rankings array
        await this.userModel.findByIdAndUpdate(
          userId,
          { $push: { rankings: saved._id } },
          { session },
        );

        return saved;
      },
    );

    // Update user's rankedPokemonCount
    const fullUser = await this.usersService.findOne(userId);
    await this.usersService.updateRankedPokemonCount(fullUser);

    return savedRanking;
  }

  async update(
    id: string,
    userId: string,
    updateRankingDto: UpdateRankingDto,
  ): Promise<Ranking> {
    const ranking = await this.rankingModel.findById(id).exec();

    if (!ranking) {
      throw new NotFoundException({ key: TK.RANKINGS.NOT_FOUND, args: { id } });
    }

    // Check ownership
    this.validateOwnership(ranking, userId);

    // Generate unique title if title is being updated
    if (updateRankingDto.title && updateRankingDto.title !== ranking.title) {
      const user = await this.userModel
        .findById(userId)
        .populate<{ rankings: Ranking[] }>('rankings', 'title')
        .exec();

      if (!user) {
        throw new NotFoundException({
          key: TK.USERS.NOT_FOUND,
          args: { id: userId },
        });
      }

      updateRankingDto.title = this.generateUniqueTitle(
        user.rankings,
        updateRankingDto.title,
        id,
      );
    }

    // Apply updates to get new values
    const updatedData = stripUndefined(updateRankingDto);
    const newZones = updatedData.zones || ranking.zones;
    const newPokemon = updatedData.pokemon || ranking.pokemon;

    // Check if pokemon count changed
    const pokemonCountChanged =
      updateRankingDto.pokemon !== undefined &&
      ranking.pokemon.length !== newPokemon.length;

    // Validate theme availability if theme is being updated
    if (updateRankingDto.theme) {
      const totalPokemon = await this.getTotalPokemonCount();
      this.validateThemeAvailability(
        updateRankingDto.theme,
        newPokemon.length,
        totalPokemon,
      );
    }

    // Apply updates
    Object.assign(ranking, updatedData);
    const savedRanking = await ranking.save();

    // Update user's rankedPokemonCount if pokemon count changed
    if (pokemonCountChanged) {
      const user = await this.usersService.findOne(userId);
      await this.usersService.updateRankedPokemonCount(user);
    }

    return savedRanking;
  }

  async findOne(id: string): Promise<Ranking> {
    const ranking = await this.rankingModel
      .findById(id)
      .populate('pokemon')
      .populate('user')
      .exec();

    if (!ranking) {
      throw new NotFoundException({ key: TK.RANKINGS.NOT_FOUND, args: { id } });
    }

    return ranking;
  }

  async findByUsername(username: string): Promise<Ranking[]> {
    const user = await this.userModel
      .findOne({ username, isActive: true })
      .exec();

    if (!user) {
      throw new NotFoundException({
        key: TK.USERS.NOT_FOUND,
        args: { username },
      });
    }

    const rankings = await this.rankingModel
      .find({ user: user._id })
      .populate('user', 'username profilePic')
      .sort({ updatedAt: -1 })
      .exec();

    return rankings;
  }

  async remove(id: string, userId: string): Promise<Ranking> {
    const deletedRanking = await withTransaction(
      this.connection,
      async (session) => {
        const ranking = await this.rankingModel
          .findById(id)
          .session(session)
          .exec();

        if (!ranking) {
          throw new NotFoundException({
            key: TK.RANKINGS.NOT_FOUND,
            args: { id },
          });
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
      },
    );

    // Update user's rankedPokemonCount
    const user = await this.usersService.findOne(userId);
    await this.usersService.updateRankedPokemonCount(user);

    return deletedRanking;
  }

  // Helper: Validate ownership
  private validateOwnership(ranking: Ranking, userId: string): void {
    if (ranking.user.toString() !== userId) {
      throw new ForbiddenException({ key: TK.RANKINGS.CANNOT_MODIFY_OTHERS });
    }
  }

  // Helper: Generate unique title by iterating over existing rankings
  private generateUniqueTitle(
    existingRankings: { title: string; _id?: Types.ObjectId }[],
    title: string,
    excludeId?: string,
  ): string {
    // Build a Set of existing titles for O(1) lookup
    const existingTitles = new Set(
      existingRankings
        .filter((r) => !excludeId || r._id?.toString() !== excludeId)
        .map((r) => r.title),
    );

    // If title doesn't exist, return as-is
    if (!existingTitles.has(title)) {
      return title;
    }

    // Find next available suffix (2), (3), etc.
    let counter = 2;
    let candidateTitle = `${title} (${counter})`;

    while (existingTitles.has(candidateTitle)) {
      counter++;
      candidateTitle = `${title} (${counter})`;
    }

    return candidateTitle;
  }

  // Helper: Get total Pokemon count in the system
  private async getTotalPokemonCount(): Promise<number> {
    return this.pokemonModel.countDocuments().exec();
  }

  // Helper: Validate theme availability based on Pokemon count
  private validateThemeAvailability(
    themeId: string,
    pokemonCount: number,
    totalPokemon: number,
  ): void {
    if (!isThemeAvailable(themeId, pokemonCount, totalPokemon)) {
      throw new BadRequestException({
        key: TK.RANKINGS.THEME_NOT_AVAILABLE,
        args: { themeId },
      });
    }
  }
}
