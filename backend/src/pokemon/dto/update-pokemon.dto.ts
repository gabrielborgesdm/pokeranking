import { IsOptional, IsString, IsArray, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsImageString } from '../../common/validators';
import { POKEMON_TYPE_VALUES, type PokemonType } from '@pokeranking/shared';

export class UpdatePokemonDto {
  @ApiPropertyOptional({ example: 'Pikachu' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'pikachu.png',
    description:
      'Pokemon image - either a filename (e.g., "pikachu.png") or a URL from whitelisted domains',
  })
  @IsString()
  @IsOptional()
  @IsImageString()
  image?: string;

  @ApiPropertyOptional({
    example: ['Electric'],
    description: 'Pokemon types',
    enum: POKEMON_TYPE_VALUES,
    isArray: true,
  })
  @IsArray()
  @IsIn(POKEMON_TYPE_VALUES, { each: true })
  @IsOptional()
  types?: PokemonType[];
}
