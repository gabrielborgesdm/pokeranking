import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { TK } from '../i18n/constants/translation-keys';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RANKED_POKEMON_COUNT, UserQueryDto } from './dto/user-query.dto';
import { stripUndefined } from '../common/utils/transform.util';
import { SessionOptions } from '../common/utils/transaction.util';
import { CacheService } from '../common/services/cache.service';
import { Ranking } from '../rankings/schemas/ranking.schema';
import { Pokemon } from '../pokemon/schemas/pokemon.schema';

/** Ranking with populated pokemon (after .populate('pokemon')) */
type RankingWithPopulatedPokemon = Omit<Ranking, 'pokemon'> & {
  pokemon: Pokemon[];
};

/** User with populated rankings and pokemon */
export type UserWithPopulatedRankings = Omit<User, 'rankings'> & {
  rankings: RankingWithPopulatedPokemon[];
};

/** Lightweight ranking summary for profile (only image and count) */
export interface RankingSummary {
  _id: string;
  title: string;
  theme: string;
  image: string | null;
  pokemonCount: number;
  likesCount: number;
  user?: {
    _id: string;
    username: string;
    profilePic?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/** User with lightweight ranking summaries for profile */
export type UserWithProfileSummary = Omit<
  User,
  'rankings' | 'likedRankings'
> & {
  rankings: RankingSummary[];
  likedRankings: RankingSummary[];
};

// 15-minute TTL to minimize Upstash free tier quota usage.
// User rankings update infrequently; slight staleness is acceptable.
const USERS_LIST_DEFAULT_CACHE_KEY = 'users:list:default';
const USERS_LIST_CACHE_TTL_SECONDS = 15 * 60;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly cacheService: CacheService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async comparePassword(
    candidatePassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  private async checkEmailUniqueness(
    email: string,
    excludeId?: string,
    options?: SessionOptions,
  ): Promise<void> {
    const query: { email: string; _id?: { $ne: string } } = { email };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await this.userModel
      .findOne(query)
      .session(options?.session ?? null)
      .exec();
    if (existing) {
      throw new ConflictException({
        key: TK.USERS.EMAIL_EXISTS,
      });
    }
  }

  private async checkUsernameUniqueness(
    username: string,
    excludeId?: string,
    options?: SessionOptions,
  ): Promise<void> {
    const query: { username: string; _id?: { $ne: string } } = { username };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await this.userModel
      .findOne(query)
      .session(options?.session ?? null)
      .exec();
    if (existing) {
      throw new ConflictException({
        key: TK.USERS.USERNAME_EXISTS,
        args: { username },
      });
    }
  }

  async create(
    createUserDto: CreateUserDto,
    options?: SessionOptions,
  ): Promise<User> {
    await this.checkEmailUniqueness(createUserDto.email, undefined, options);
    await this.checkUsernameUniqueness(
      createUserDto.username,
      undefined,
      options,
    );

    const hashedPassword = await this.hashPassword(createUserDto.password);

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    const saved = await user.save({ session: options?.session });

    this.logger.log(`User created: ${saved.username}`);

    return saved;
  }

  async findAll(
    query: UserQueryDto,
  ): Promise<{ users: User[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'rankedPokemonCount',
      order = 'desc',
      username,
    } = query;

    // Check if this is the default query (cacheable)
    const isDefaultQuery =
      page === 1 &&
      limit === 20 &&
      sortBy === RANKED_POKEMON_COUNT &&
      order === 'desc' &&
      !username;

    // Try cache for default query
    if (isDefaultQuery) {
      const cached = await this.cacheService.get<{
        users: User[];
        total: number;
      }>(USERS_LIST_DEFAULT_CACHE_KEY);
      if (cached) {
        return cached;
      }
    }

    // Build query: only active users
    const baseQuery: Record<string, unknown> = {
      isActive: true,
    };

    // Apply username filter (partial match, case-insensitive)
    if (username) {
      baseQuery.username = { $regex: username, $options: 'i' };
    }

    // Get total count
    const total = await this.userModel.countDocuments(baseQuery).exec();

    // Get paginated results
    const users = await this.userModel
      .find(baseQuery)
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<User[]>()
      .exec();

    const result = { users, total };

    // Cache default query results
    if (isDefaultQuery) {
      await this.cacheService.set(
        USERS_LIST_DEFAULT_CACHE_KEY,
        result,
        USERS_LIST_CACHE_TTL_SECONDS,
      );
    }

    return result;
  }

  async findOne(
    id: string,
    options?: SessionOptions,
  ): Promise<UserWithPopulatedRankings> {
    const user = await this.userModel
      .findById(id)
      .populate<{ rankings: RankingWithPopulatedPokemon[] }>({
        path: 'rankings',
        populate: { path: 'pokemon' },
      })
      .session(options?.session ?? null)
      .exec();
    if (!user) {
      throw new NotFoundException({ key: TK.USERS.NOT_FOUND, args: { id } });
    }
    return user;
  }

  async findOneWithProfile(
    id: string,
    options?: SessionOptions,
  ): Promise<UserWithProfileSummary> {
    // Shared pipeline for ranking summary projection
    const rankingSummaryPipeline = [
      // Get only the first pokemon's image (preserving order)
      {
        $addFields: {
          firstPokemonId: { $arrayElemAt: ['$pokemon', 0] },
        },
      },
      {
        $lookup: {
          from: 'pokemon',
          localField: 'firstPokemonId',
          foreignField: '_id',
          as: 'firstPokemon',
          pipeline: [{ $project: { image: 1 } }],
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userData',
          pipeline: [{ $project: { username: 1, profilePic: 1 } }],
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          theme: 1,
          background: 1,
          likesCount: 1,
          createdAt: 1,
          updatedAt: 1,
          image: {
            $ifNull: [{ $arrayElemAt: ['$firstPokemon.image', 0] }, null],
          },
          pokemonCount: { $size: { $ifNull: ['$pokemon', []] } },
          user: { $arrayElemAt: ['$userData', 0] },
        },
      },
    ];

    const pipeline = [
      { $match: { _id: new Types.ObjectId(id) } },
      // Lookup rankings with only necessary fields
      {
        $lookup: {
          from: 'rankings',
          localField: 'rankings',
          foreignField: '_id',
          as: 'rankings',
          pipeline: rankingSummaryPipeline,
        },
      },
      // Lookup likedRankings with only necessary fields
      {
        $lookup: {
          from: 'rankings',
          localField: 'likedRankings',
          foreignField: '_id',
          as: 'likedRankings',
          pipeline: rankingSummaryPipeline,
        },
      },
    ];

    const results = await this.userModel
      .aggregate(pipeline)
      .session(options?.session ?? null)
      .exec();

    if (!results || results.length === 0) {
      throw new NotFoundException({ key: TK.USERS.NOT_FOUND, args: { id } });
    }

    return results[0] as UserWithProfileSummary;
  }

  async findByEmail(
    email: string,
    options?: SessionOptions,
  ): Promise<User | null> {
    return await this.userModel
      .findOne({ email })
      .select('+password')
      .session(options?.session ?? null)
      .exec();
  }

  async deleteInactiveByEmailOrUsername(
    email: string,
    username: string,
    options?: SessionOptions,
  ): Promise<void> {
    await this.userModel
      .deleteMany({
        $or: [{ email }, { username }],
        isActive: false,
      })
      .session(options?.session ?? null)
      .exec();
  }

  async findByUsername(
    username: string,
    options?: SessionOptions,
  ): Promise<User | null> {
    return await this.userModel
      .findOne({ username })
      .select('+password')
      .session(options?.session ?? null)
      .exec();
  }

  async findByUsernameOrEmail(
    identifier: string,
    options?: SessionOptions,
  ): Promise<User | null> {
    const isEmail = identifier.includes('@');
    const query = isEmail
      ? { email: identifier.toLowerCase() }
      : { username: identifier };

    return await this.userModel
      .findOne(query)
      .select('+password')
      .session(options?.session ?? null)
      .exec();
  }

  async findByVerificationToken(
    token: string,
    options?: SessionOptions,
  ): Promise<User | null> {
    return await this.userModel
      .findOne({
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: new Date() },
      })
      .session(options?.session ?? null)
      .exec();
  }

  async findByEmailAndVerificationCode(
    email: string,
    code: string,
    options?: SessionOptions,
  ): Promise<User | null> {
    return await this.userModel
      .findOne({
        email: email.toLowerCase(),
        emailVerificationCode: code,
        emailVerificationExpires: { $gt: new Date() },
      })
      .session(options?.session ?? null)
      .exec();
  }

  async findByPasswordResetToken(
    token: string,
    options?: SessionOptions,
  ): Promise<User | null> {
    return await this.userModel
      .findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      })
      .session(options?.session ?? null)
      .exec();
  }

  async count(options?: SessionOptions): Promise<number> {
    return await this.userModel
      .countDocuments()
      .session(options?.session ?? null)
      .exec();
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    options?: SessionOptions,
  ): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .session(options?.session ?? null)
      .exec();
    if (!user) {
      throw new NotFoundException({ key: TK.USERS.NOT_FOUND, args: { id } });
    }

    // Check for username uniqueness if username is being updated
    if (updateUserDto.username && updateUserDto.username !== user.username) {
      await this.checkUsernameUniqueness(updateUserDto.username, id, options);
    }

    // Hash password if it's being updated
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }
    // Apply updates, ignoring undefined fields
    Object.assign(user, stripUndefined(updateUserDto));
    const saved = await user.save({ session: options?.session });

    const differentUsername =
      updateUserDto.username && updateUserDto.username !== user.username;
    if (differentUsername) {
      this.logger.log(
        `User updated: ${user.username} -> ${updateUserDto.username}`,
      );
    } else {
      this.logger.log(`User updated: ${saved.username}`);
    }

    return saved;
  }

  async remove(id: string, options?: SessionOptions): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .session(options?.session ?? null)
      .exec();
    if (!user) {
      throw new NotFoundException({ key: TK.USERS.NOT_FOUND, args: { id } });
    }

    await user.deleteOne({ session: options?.session });

    this.logger.log(`User deleted: ${user.username}`);

    return user;
  }

  /**
   * Updates the rankedPokemonCount for a user based on their rankings.
   * Only updates if the value has changed.
   * @param user - The user with populated rankings
   */
  async updateRankedPokemonCount(
    user: UserWithPopulatedRankings,
  ): Promise<void> {
    const totalCount = user.rankings.reduce(
      (sum, r) => sum + r.pokemon.length,
      0,
    );

    // Only update if the value has changed
    if (user.rankedPokemonCount === totalCount) {
      return;
    }

    await this.userModel.findByIdAndUpdate(user._id, {
      rankedPokemonCount: totalCount,
    });

    this.logger.debug(
      `Updated ranked pokemon count for ${user.username}: ${totalCount}`,
    );

    await this.invalidateUsersListCache();
  }

  /**
   * Invalidates the users list cache.
   */
  async invalidateUsersListCache(): Promise<void> {
    await this.cacheService.del(USERS_LIST_DEFAULT_CACHE_KEY);
  }
}
