import { Pokemon } from '../../pokemon/schemas/pokemon.schema';
import { PokemonResponseDto } from '../../pokemon/dto/pokemon-response.dto';
import { toDto } from './transform.util';

export function mapToPokemonResponseDto(
  pokemonArray: Pokemon[],
): PokemonResponseDto[] {
  return toDto(PokemonResponseDto, pokemonArray);
}
