import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { TK } from '../i18n/constants/translation-keys';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from './schemas/pokemon.schema';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PokemonResponseDto } from './dto/pokemon-response.dto';
import { stripUndefined, toDto } from 'src/common/utils/transform.util';
import { CacheService } from 'src/common/services/cache.service';

const POKEMON_ALL_CACHE_KEY = 'pokemon:all';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
    private readonly cacheService: CacheService,
  ) {}

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

    await this.cacheService.del(POKEMON_ALL_CACHE_KEY);

    return saved;
  }

  /**
   * Retrieves all Pokemon from cache or database.
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

    const pokemon = await this.pokemonModel.find().lean().exec();
    const dtos = toDto(PokemonResponseDto, pokemon);

    await this.cacheService.set(POKEMON_ALL_CACHE_KEY, dtos);
    return dtos;
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
    Logger.log('Updating pokemon:', updatePokemonDto);
    if (!pokemon) {
      throw new NotFoundException({ key: TK.POKEMON.NOT_FOUND, args: { id } });
    }

    // Remove undefined fields from the update DTO before applying the update
    Object.assign(pokemon, stripUndefined(updatePokemonDto));
    Logger.log('Updated pokemon:', pokemon);
    const updated = await pokemon.save();

    await this.cacheService.del(POKEMON_ALL_CACHE_KEY);

    return updated;
  }

  async remove(id: string): Promise<Pokemon> {
    const pokemon = await this.pokemonModel.findById(id).exec();
    if (!pokemon) {
      throw new NotFoundException({ key: TK.POKEMON.NOT_FOUND, args: { id } });
    }

    await pokemon.deleteOne();

    await this.cacheService.del(POKEMON_ALL_CACHE_KEY);

    return pokemon;
  }
}
