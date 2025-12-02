import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { TK } from '../i18n/constants/translation-keys';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { stripUndefined } from 'src/common/utils/transform.util';
import { SessionOptions } from 'src/common/utils/transaction.util';
import { CacheService } from 'src/common/services/cache.service';
import { Ranking } from 'src/rankings/schemas/ranking.schema';

import { Pokemon } from 'src/pokemon/schemas/pokemon.schema';

/** Ranking with populated pokemon (after .populate('pokemon')) */
type RankingWithPopulatedPokemon = Omit<Ranking, 'pokemon'> & {
  pokemon: Pokemon[];
};

/** User with populated rankings and pokemon */
export type UserWithPopulatedRankings = Omit<User, 'rankings'> & {
  rankings: RankingWithPopulatedPokemon[];
};

// 15-minute TTL to minimize Upstash free tier quota usage.
// User rankings update infrequently; slight staleness is acceptable.
const USERS_LIST_DEFAULT_CACHE_KEY = 'users:list:default';
const USERS_LIST_CACHE_TTL_SECONDS = 15 * 60;

@Injectable()
export class UsersService {
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
        args: { email },
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
    return await user.save({ session: options?.session });
  }

  async findAll(
    query: UserQueryDto,
  ): Promise<{ users: User[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'highestCountOfRankedPokemon',
      order = 'desc',
      username,
    } = query;

    // Check if this is the default query (cacheable)
    const isDefaultQuery =
      page === 1 &&
      limit === 20 &&
      sortBy === 'highestCountOfRankedPokemon' &&
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

    // Check for email uniqueness if email is being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      await this.checkEmailUniqueness(updateUserDto.email, id, options);
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
    return await user.save({ session: options?.session });
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
    return user;
  }

  /**
   * Updates the highestCountOfRankedPokemon for a user based on their rankings.
   * Only updates if the value has changed.
   * @param user - The user with populated rankings
   */
  async updateHighestRankedPokemonCount(
    user: UserWithPopulatedRankings,
  ): Promise<void> {
    const highestCount =
      user.rankings.length > 0
        ? Math.max(...user.rankings.map((r) => r.pokemon.length))
        : 0;

    // Only update if the value has changed
    if (user.highestCountOfRankedPokemon === highestCount) {
      return;
    }

    await this.userModel.findByIdAndUpdate(user._id, {
      highestCountOfRankedPokemon: highestCount,
    });

    await this.invalidateUsersListCache();
  }

  /**
   * Invalidates the users list cache.
   */
  async invalidateUsersListCache(): Promise<void> {
    await this.cacheService.del(USERS_LIST_DEFAULT_CACHE_KEY);
  }
}
