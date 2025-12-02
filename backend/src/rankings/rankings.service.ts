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
import { Zone } from './schemas/ranking.schema';
import { User } from '../users/schemas/user.schema';
import { withTransaction } from '../common/utils/transaction.util';
import { UsersService } from '../users/users.service';

@Injectable()
export class RankingsService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(Ranking.name) private readonly rankingModel: Model<Ranking>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
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

        // Validate zone intervals if zones provided
        if (createRankingDto.zones && createRankingDto.zones.length > 0) {
          const pokemonCount = createRankingDto.pokemon?.length || 0;
          this.validateZoneIntervals(createRankingDto.zones, pokemonCount);
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

    // Validate zone intervals with new data
    if (newZones && newZones.length > 0) {
      this.validateZoneIntervals(newZones, newPokemon.length);
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

  // Helper: Validate zone intervals don't exceed pokemon count
  private validateZoneIntervals(zones: Zone[], pokemonCount: number): void {
    for (const zone of zones) {
      const [, end] = zone.interval;

      if (end > pokemonCount) {
        throw new BadRequestException({
          key: TK.RANKINGS.ZONE_EXCEEDS_POKEMON,
          args: {
            zoneName: zone.name,
            start: zone.interval[0],
            end,
            count: pokemonCount,
          },
        });
      }
    }
  }
}
