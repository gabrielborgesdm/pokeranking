import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from './schemas/pokemon.schema';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { stripUndefined } from 'src/common/utils/transform.util';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto): Promise<Pokemon> {
    const existing = await this.pokemonModel
      .findOne({ name: createPokemonDto.name })
      .exec();

    if (existing) {
      throw new ConflictException(
        `Pokemon with name "${createPokemonDto.name}" already exists`,
      );
    }

    const pokemon = new this.pokemonModel(createPokemonDto);
    return await pokemon.save();
  }

  async findAll(): Promise<Pokemon[]> {
    return await this.pokemonModel.find().exec();
  }

  async findOne(id: string): Promise<Pokemon> {
    const pokemon = await this.pokemonModel.findById(id).exec();
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with ID ${id} not found`);
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
      throw new NotFoundException(`Pokemon with ID ${id} not found`);
    }

    // Remove undefined fields from the update DTO before applying the update
    Object.assign(pokemon, stripUndefined(updatePokemonDto));
    Logger.log('Updated pokemon:', pokemon);
    return await pokemon.save();
  }

  async remove(id: string): Promise<Pokemon> {
    const pokemon = await this.pokemonModel.findById(id).exec();
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with ID ${id} not found`);
    }

    await pokemon.deleteOne();
    return pokemon;
  }
}
