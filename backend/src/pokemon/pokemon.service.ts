import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { QueryFilter } from 'mongoose';
import { Model } from 'mongoose';
import { CacheService } from '../common/services/cache.service';
import { stripUndefined, toDto } from '../common/utils/transform.util';
import { TK } from '../i18n/constants/translation-keys';
import { UploadService } from '../upload/upload.service';
import { BulkCreatePokemonItemDto } from './dto/bulk-create-pokemon-response.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { PokemonQueryDto } from './dto/pokemon-query.dto';
import { PokemonResponseDto } from './dto/pokemon-response.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './schemas/pokemon.schema';

const POKEMON_ALL_CACHE_KEY = 'pokemon:all';
const POKEMON_COUNT_CACHE_KEY = 'pokemon:total_count';
const POKEMON_COUNT_CACHE_TTL = 1800; // 30 minutes
const POKEMON_VERSION_CACHE_KEY = 'pokemon:version';

@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name);

  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
    private readonly cacheService: CacheService,
    private readonly uploadService: UploadService,
  ) { }

  async create(createPokemonDto: CreatePokemonDto): Promise<Pokemon> {
    const existing = await this.pokemonModel
      .findOne({ name: createPokemonDto.name })
      .exec();

    if (existing) {
      throw new ConflictException({
        key: TK.POKEMON.NAME_EXISTS,
        args: { name: createPokemonDto.name },
      });
    }

    const pokemon = new this.pokemonModel(createPokemonDto);
    const saved = await pokemon.save();

    await this.invalidateCountCache();

    this.logger.log(`Pokemon created: ${saved.name}`);

    return saved;
  }

  async createBulk(
    pokemonList: CreatePokemonDto[],
  ): Promise<BulkCreatePokemonItemDto[]> {
    const results: BulkCreatePokemonItemDto[] = [];

    // Get all existing names in one query for efficiency
    const names = pokemonList.map((p) => p.name);
    const existingPokemon = await this.pokemonModel
      .find({ name: { $in: names } })
      .lean()
      .exec();
    const existingNames = new Set(existingPokemon.map((p) => p.name));

    for (let i = 0; i < pokemonList.length; i++) {
      const dto = pokemonList[i];

      if (!dto) {
        continue;
      }

      // Check if name already exists (from initial query or created in this batch)
      if (dto.name && existingNames.has(dto.name)) {
        results.push({
          index: i,
          name: dto.name,
          success: false,
          error: `Pokemon with name "${dto.name}" already exists`,
          errorCode: 'NAME_EXISTS',
        });
        continue;
      }

      try {
        const created = new this.pokemonModel(dto);
        const saved = await created.save();
        existingNames.add(dto.name); // Prevent duplicates within same batch

        results.push({
          index: i,
          name: dto.name,
          success: true,
          pokemon: toDto(PokemonResponseDto, saved),
        });
      } catch (error) {
        results.push({
          index: i,
          name: dto.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorCode: 'CREATE_FAILED',
        });
      }
    }

    // Invalidate cache if any were created
    const successCount = results.filter((r) => r.success).length;
    if (successCount > 0) {
      await this.invalidateCountCache();
      this.logger.log(`Bulk created ${successCount}/${pokemonList.length} Pokemon`);
    }

    return results;
  }

  /**
   * Retrieves all Pokemon from cache or database (no pagination).
   *
   * Returns PokemonResponseDto[] directly from the service (rather than transforming
   * in the controller) because:
   * 1. Cached data must have the same shape as fresh data for type safety
   * 2. Using lean() returns plain objects that need DTO transformation before caching
   * 3. Avoids double transformation (once for caching, once in controller)
   *
   * Cache has no TTL because it's explicitly invalidated on every mutation (create/update/remove).
   * This ensures data is always fresh while avoiding unnecessary cache misses from expiration.
   */
  async findAll(): Promise<PokemonResponseDto[]> {
    const cached = await this.cacheService.get<PokemonResponseDto[]>(
      POKEMON_ALL_CACHE_KEY,
    );
    if (cached) {
      return cached;
    }

    const pokemon = await this.pokemonModel
      .find()
      .lean()
      .exec();
    const dtos = toDto(PokemonResponseDto, pokemon);

    await this.cacheService.set(POKEMON_ALL_CACHE_KEY, dtos);
    return dtos;
  }

  /**
   * Retrieves Pokemon with pagination, filtering, and sorting.
   * Used for admin list with search and type filtering.
   */
  async findAllPaginated(
    query: PokemonQueryDto,
  ): Promise<{ pokemon: Pokemon[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;
    const skip = (page - 1) * limit;

    const filter = this.buildFilter(query);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [pokemon, total] = await Promise.all([
      this.pokemonModel
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean<Pokemon[]>()
        .exec(),
      this.pokemonModel.countDocuments(filter).exec(),
    ]);

    return { pokemon, total };
  }

  private buildFilter(query: PokemonQueryDto): QueryFilter<Pokemon> {
    const filter: QueryFilter<Pokemon> = {};

    if (query.name) {
      filter.name = { $regex: query.name, $options: 'i' };
    }

    if (query.types && query.types.length > 0) {
      filter.types = { $in: query.types };
    }

    return filter;
  }

  async findOne(id: string): Promise<Pokemon> {
    const pokemon = await this.pokemonModel.findById(id).exec();
    if (!pokemon) {
      throw new NotFoundException({ key: TK.POKEMON.NOT_FOUND, args: { id } });
    }
    return pokemon;
  }

  async update(
    id: string,
    updatePokemonDto: UpdatePokemonDto,
  ): Promise<Pokemon> {
    const pokemon = await this.pokemonModel.findById(id).exec();
    this.logger.debug(`Updating pokemon: ${JSON.stringify(updatePokemonDto)}`);
    if (!pokemon) {
      throw new NotFoundException({ key: TK.POKEMON.NOT_FOUND, args: { id } });
    }

    // Check if image is being updated and delete the old one from the provider
    const oldImage = pokemon.image;
    const newImage = updatePokemonDto.image;
    if (newImage !== undefined && oldImage && oldImage !== newImage) {
      this.logger.log(`Image changed, deleting old image: ${oldImage}`);
      // Delete in background, don't block the update
      this.uploadService.deleteImage(oldImage).catch((error) => {
        this.logger.error(`Failed to delete old image: ${oldImage}`, error);
      });
    }

    // Remove undefined fields from the update DTO before applying the update
    Object.assign(pokemon, stripUndefined(updatePokemonDto));
    const updated = await pokemon.save();

    this.logger.log(`Pokemon updated: ${updated.name}`);

    await Promise.all([
      this.cacheService.del(POKEMON_ALL_CACHE_KEY),
      this.updateVersion(),
    ]);

    return updated;
  }

  async remove(id: string): Promise<Pokemon> {
    const pokemon = await this.pokemonModel.findById(id).exec();
    if (!pokemon) {
      throw new NotFoundException({ key: TK.POKEMON.NOT_FOUND, args: { id } });
    }

    // Delete the image from the provider if it exists
    if (pokemon.image) {
      this.logger.log(`Deleting image for removed pokemon: ${pokemon.image}`);
      // Delete in background, don't block the removal
      this.uploadService.deleteImage(pokemon.image).catch((error) => {
        this.logger.error(`Failed to delete image: ${pokemon.image}`, error);
      });
    }

    await pokemon.deleteOne();

    await this.invalidateCountCache();

    this.logger.log(`Pokemon deleted: ${pokemon.name}`);

    return pokemon;
  }

  /**
   * Get the total count of Pokemon in the system.
   * Uses Redis cache with 24h TTL, invalidated on create/remove.
   */
  async getCachedTotalCount(): Promise<number> {
    const cached = await this.cacheService.get<number>(POKEMON_COUNT_CACHE_KEY);
    if (cached !== null) {
      return cached;
    }

    const count = await this.pokemonModel.countDocuments().exec();
    await this.cacheService.set(
      POKEMON_COUNT_CACHE_KEY,
      count,
      POKEMON_COUNT_CACHE_TTL,
    );
    return count;
  }

  /**
   * Get the current Pokemon data version (timestamp).
   * Returns null if cache is unavailable.
   */
  async getCurrentVersion(): Promise<number | null> {
    return this.cacheService.get<number>(POKEMON_VERSION_CACHE_KEY);
  }

  /**
   * Updates the Pokemon data version to the current timestamp.
   * Called whenever Pokemon data is mutated.
   * @returns The new version timestamp
   */
  private async updateVersion(): Promise<number> {
    const newVersion = Date.now();
    await this.cacheService.set(POKEMON_VERSION_CACHE_KEY, newVersion);
    return newVersion;
  }

  /**
   * Check if Pokemon data has changed since the client's version.
   * Returns true if:
   * - Client version is not provided
   * - Cache read fails (fail-safe: assume changes)
   * - Current version is newer than client version
   */
  async hasChanges(clientVersion?: number): Promise<{
    hasChanges: boolean;
    currentVersion: number;
  }> {
    const currentVersion = await this.getCurrentVersion();

    // If cache fails or no version exists, assume changes and set a new version
    if (currentVersion === null) {
      const newVersion = await this.updateVersion();
      return { hasChanges: true, currentVersion: newVersion };
    }

    // If client didn't provide a version, they need to fetch
    if (clientVersion === undefined) {
      return { hasChanges: true, currentVersion };
    }

    // Compare versions
    return {
      hasChanges: currentVersion > clientVersion,
      currentVersion,
    };
  }

  /**
   * Invalidates the count cache. Called on create/remove operations.
   * Also invalidates the all Pokemon cache and updates the version.
   */
  private async invalidateCountCache(): Promise<void> {
    await Promise.all([
      this.cacheService.del(POKEMON_ALL_CACHE_KEY),
      this.cacheService.del(POKEMON_COUNT_CACHE_KEY),
      this.updateVersion(),
    ]);
  }
}
