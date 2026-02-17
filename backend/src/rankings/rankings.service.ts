import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { TK } from '../i18n/constants/translation-keys';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Types, Connection, PipelineStage } from 'mongoose';
import { Ranking } from './schemas/ranking.schema';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateRankingDto } from './dto/update-ranking.dto';
import { RankingQueryDto, LIKES_COUNT } from './dto/ranking-query.dto';
import { stripUndefined } from '../common/utils/transform.util';
import { User } from '../users/schemas/user.schema';
import { Pokemon } from '../pokemon/schemas/pokemon.schema';
import { withTransaction } from '../common/utils/transaction.util';
import { UsersService } from '../users/users.service';
import { CacheService } from '../common/services/cache.service';
import { isThemeAvailable } from '@pokeranking/shared';

const RANKINGS_LIST_DEFAULT_CACHE_KEY = 'rankings:list:default';
const RANKINGS_LIST_CACHE_TTL_SECONDS = 15 * 60; // 15 minutes

interface RankingListItem {
  _id: Types.ObjectId;
  title: string;
  theme: string;
  background: string;
  image: string | null;
  pokemonCount: number;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    username: string;
  };
}

@Injectable()
export class RankingsService {
  private readonly logger = new Logger(RankingsService.name);

  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(Ranking.name) private readonly rankingModel: Model<Ranking>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
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

    await this.validateThemeElegibility(
      userId,
      createRankingDto.theme,
      createRankingDto.background,
    );

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

    this.logger.log(
      `Ranking created: "${savedRanking.title}" with ${savedRanking.pokemon.length} Pokemon`,
    );

    return savedRanking;
  }

  async validateThemeElegibility(
    userId: string,
    themeId?: string,
    backgroundId?: string,
  ): Promise<void> {
    // Validate theme availability if theme is being updated
    if (themeId) {
      await this.validateThemeForUser(themeId, userId);
    }

    if (backgroundId) {
      await this.validateThemeForUser(backgroundId, userId);
    }
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

    await this.validateThemeElegibility(
      userId,
      updateRankingDto.theme,
      updateRankingDto.background,
    );

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

    // Apply updates
    Object.assign(ranking, updatedData);
    const savedRanking = await ranking.save();

    // Update user's rankedPokemonCount if pokemon count changed
    if (pokemonCountChanged) {
      const user = await this.usersService.findOne(userId);
      await this.usersService.updateRankedPokemonCount(user);
    }

    this.logger.log(`Ranking updated: "${savedRanking.title}"`);

    return savedRanking;
  }

  async findOne(id: string): Promise<Ranking> {
    const ranking = await this.rankingModel
      .findById(id)
      .populate('pokemon')
      .populate('user')
      .populate('likedBy', 'username profilePic')
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

        // Remove ranking from all users' likedRankings arrays
        await this.userModel
          .updateMany(
            { likedRankings: ranking._id },
            { $pull: { likedRankings: ranking._id } },
          )
          .session(session);

        return ranking;
      },
    );

    // Update user's rankedPokemonCount
    const user = await this.usersService.findOne(userId);
    await this.usersService.updateRankedPokemonCount(user);

    // Invalidate rankings list cache
    const cachedList = await this.cacheService.get<{
      rankings: RankingListItem[];
      total: number;
    }>(RANKINGS_LIST_DEFAULT_CACHE_KEY);
    const wasCached = cachedList?.rankings?.some(
      (r) => r._id?.toString() === deletedRanking._id?.toString(),
    );
    if (cachedList && wasCached) {
      await this.cacheService.del(RANKINGS_LIST_DEFAULT_CACHE_KEY);
      this.logger.log('Rankings list cache invalidated due to deletion');
    }

    this.logger.log(`Ranking deleted: "${deletedRanking.title}"`);

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
      this.logger.warn(
        `Theme validation failed for user ${userId}: ${themeId}`,
      );
      throw new BadRequestException({
        key: TK.RANKINGS.THEME_NOT_AVAILABLE,
        args: { themeId },
      });
    }
  }

  /**
   * Toggle like status for a ranking
   */
  async toggleLike(
    rankingId: string,
    userId: string,
  ): Promise<{ isLiked: boolean; likesCount: number }> {
    const ranking = await this.rankingModel.findById(rankingId).exec();

    if (!ranking) {
      throw new NotFoundException({
        key: TK.RANKINGS.NOT_FOUND,
        args: { id: rankingId },
      });
    }

    const userObjectId = new Types.ObjectId(userId);
    const isCurrentlyLiked = ranking.likedBy.some((id) =>
      id.equals(userObjectId),
    );

    if (isCurrentlyLiked) {
      // Unlike
      await this.rankingModel.findByIdAndUpdate(rankingId, {
        $pull: { likedBy: userObjectId },
        $inc: { likesCount: -1 },
      });
      await this.userModel.findByIdAndUpdate(userId, {
        $pull: { likedRankings: ranking._id },
      });
    } else {
      // Like
      await this.rankingModel.findByIdAndUpdate(rankingId, {
        $addToSet: { likedBy: userObjectId },
        $inc: { likesCount: 1 },
      });
      await this.userModel.findByIdAndUpdate(userId, {
        $addToSet: { likedRankings: ranking._id },
      });
    }

    const updatedRanking = await this.rankingModel
      .findById(rankingId)
      .select('likesCount')
      .exec();

    const isLiked = !isCurrentlyLiked;
    this.logger.log(
      `Ranking ${isLiked ? 'liked' : 'unliked'}: "${ranking.title}"`,
    );

    return {
      isLiked,
      likesCount: updatedRanking?.likesCount ?? 0,
    };
  }

  /**
   * Check if a user has liked a ranking (utility - no fetch)
   */
  isLikedByUser(ranking: Ranking, userId: string | undefined): boolean {
    if (!userId) return false;
    return ranking.likedBy.some((id) => id.toString() === userId);
  }

  /**
   * Browse all rankings with pagination
   */
  async findPaginated(
    query: RankingQueryDto,
  ): Promise<{ rankings: RankingListItem[]; total: number }> {
    const {
      page = 1,
      limit = 12,
      sortBy = LIKES_COUNT,
      order = 'desc',
      search,
    } = query;

    // Check if this is the default query (cacheable)
    const isDefaultQuery =
      page === 1 &&
      limit === 12 &&
      sortBy === LIKES_COUNT &&
      order === 'desc' &&
      !search;

    // Try cache for default query
    if (isDefaultQuery) {
      const cached = await this.cacheService.get<{
        rankings: RankingListItem[];
        total: number;
      }>(RANKINGS_LIST_DEFAULT_CACHE_KEY);
      if (cached) {
        return cached;
      }
    }

    // Build aggregation pipeline
    const pipeline: PipelineStage[] = [];

    // Filter out empty rankings (no pokemon)
    pipeline.push({
      $match: {
        $expr: { $gt: [{ $size: { $ifNull: ['$pokemon', []] } }, 0] },
      },
    });

    // Lookup user data for username only
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userData',
        pipeline: [{ $project: { username: 1 } }],
      },
    });

    // Unwind user data
    pipeline.push({ $unwind: '$userData' });

    // Apply search filter (title or username)
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { 'userData.username': { $regex: search, $options: 'i' } },
          ],
        },
      });
    }

    // Add pokemonCount field
    pipeline.push({
      $addFields: {
        pokemonCount: { $size: { $ifNull: ['$pokemon', []] } },
      },
    });

    // Sort
    const sortField = sortBy === 'pokemonCount' ? 'pokemonCount' : sortBy;
    pipeline.push({
      $sort: { [sortField]: order === 'asc' ? 1 : -1, _id: -1 },
    });

    // Count total before pagination
    const countPipeline: PipelineStage[] = [...pipeline, { $count: 'total' }];
    const countResult = await this.rankingModel
      .aggregate<{ total: number }>(countPipeline)
      .exec();
    const total = countResult[0]?.total ?? 0;

    // Pagination
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    // Get first pokemon image
    pipeline.push({
      $lookup: {
        from: 'pokemon',
        let: { firstPokemon: { $arrayElemAt: ['$pokemon', 0] } },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$firstPokemon'] } } },
          { $project: { image: 1 } },
        ],
        as: 'firstPokemonData',
      },
    });

    // Project final shape
    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        theme: 1,
        image: { $arrayElemAt: ['$firstPokemonData.image', 0] },
        pokemonCount: 1,
        likesCount: 1,
        createdAt: 1,
        updatedAt: 1,
        user: {
          username: '$userData.username',
        },
      },
    });

    const rankings = await this.rankingModel
      .aggregate<RankingListItem>(pipeline)
      .exec();

    const result = { rankings, total };

    // Cache default query results
    if (isDefaultQuery) {
      await this.cacheService.set(
        RANKINGS_LIST_DEFAULT_CACHE_KEY,
        result,
        RANKINGS_LIST_CACHE_TTL_SECONDS,
      );
    }

    return result;
  }
}
