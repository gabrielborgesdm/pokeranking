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
  ) { }

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

    // Validate theme availability if theme provided (before transaction)
    if (createRankingDto.theme) {
      await this.validateThemeForUser(createRankingDto.theme, userId);
    }

    const savedRanking = await withTransaction(
      this.connection,
      async (session) => {
        // Generate unique title from existing rankings
        const uniqueTitle = this.generateUniqueTitle(
          user.rankings,
          createRankingDto.title,
        );

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
    const newPokemon = updatedData.pokemon || ranking.pokemon;

    // Check if pokemon count changed
    const pokemonCountChanged =
      updateRankingDto.pokemon !== undefined &&
      ranking.pokemon.length !== newPokemon.length;

    // Validate theme availability if theme is being updated
    if (updateRankingDto.theme) {
      await this.validateThemeForUser(updateRankingDto.theme, userId);
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

  async find(userId: string) {
    const rankings = await this.rankingModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();

    // Get first pokemon IDs from each ranking
    const firstPokemonIds = rankings
      .map((r) => r.pokemon?.[0])
      .filter((id): id is Types.ObjectId => !!id);

    // Fetch only the first pokemon images in a single query
    const pokemonImages = await this.pokemonModel
      .find({ _id: { $in: firstPokemonIds } })
      .select('_id image')
      .lean()
      .exec();

    const imageMap = new Map(
      pokemonImages.map((p) => [p._id.toString(), p.image]),
    );

    console.log('Image Map:', imageMap);

    return rankings.map((ranking) => ({
      ...ranking,
      image: ranking.pokemon?.[0]
        ? (imageMap.get(ranking.pokemon[0].toString()) ?? null)
        : null,
      pokemonCount: ranking.pokemon?.length ?? 0,
    }));
  }

  async findByUsername(username: string) {
    const user = await this.userModel
      .findOne({ username, isActive: true })
      .exec();

    if (!user) {
      throw new NotFoundException({
        key: TK.USERS.NOT_FOUND,
        args: { username },
      });
    }

    return this.find(user._id.toString());
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

  // Helper: Get user's total ranked Pokemon count across all rankings
  private async getUserTotalRankedPokemon(userId: string): Promise<number> {
    const rankings = await this.rankingModel
      .find({ user: new Types.ObjectId(userId) })
      .select('pokemon')
      .lean()
      .exec();

    return rankings.reduce((sum, r) => sum + (r.pokemon?.length ?? 0), 0);
  }

  // Helper: Validate theme availability based on user's total ranked Pokemon
  private async validateThemeForUser(
    themeId: string,
    userId: string,
  ): Promise<void> {
    const [userTotalRanked, totalPokemonInSystem] = await Promise.all([
      this.getUserTotalRankedPokemon(userId),
      this.getTotalPokemonCount(),
    ]);

    if (!isThemeAvailable(themeId, userTotalRanked, totalPokemonInSystem)) {
      throw new BadRequestException({
        key: TK.RANKINGS.THEME_NOT_AVAILABLE,
        args: { themeId },
      });
    }
  }
}
