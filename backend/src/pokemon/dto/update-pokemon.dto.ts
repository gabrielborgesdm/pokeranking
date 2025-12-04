import {
  IsOptional,
  IsString,
  IsArray,
  IsIn,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
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

  @ApiPropertyOptional({ example: 25, description: 'National Pokedex number' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  pokedexNumber?: number;

  @ApiPropertyOptional({
    example: 'Mouse Pokémon',
    description: 'Species classification',
  })
  @IsString()
  @IsOptional()
  species?: string;

  @ApiPropertyOptional({ example: 0.4, description: 'Height in meters' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({ example: 6.0, description: 'Weight in kilograms' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({
    example: ['Static', 'Lightning Rod'],
    description: 'Pokemon abilities',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  abilities?: string[];

  @ApiPropertyOptional({ example: 35, description: 'Base HP stat' })
  @IsNumber()
  @Min(1)
  @Max(255)
  @IsOptional()
  hp?: number;

  @ApiPropertyOptional({ example: 55, description: 'Base Attack stat' })
  @IsNumber()
  @Min(1)
  @Max(255)
  @IsOptional()
  attack?: number;

  @ApiPropertyOptional({ example: 40, description: 'Base Defense stat' })
  @IsNumber()
  @Min(1)
  @Max(255)
  @IsOptional()
  defense?: number;

  @ApiPropertyOptional({ example: 50, description: 'Base Special Attack stat' })
  @IsNumber()
  @Min(1)
  @Max(255)
  @IsOptional()
  specialAttack?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Base Special Defense stat',
  })
  @IsNumber()
  @Min(1)
  @Max(255)
  @IsOptional()
  specialDefense?: number;

  @ApiPropertyOptional({ example: 90, description: 'Base Speed stat' })
  @IsNumber()
  @Min(1)
  @Max(255)
  @IsOptional()
  speed?: number;

  @ApiPropertyOptional({ example: 1, description: 'Generation introduced' })
  @IsNumber()
  @Min(1)
  @Max(9)
  @IsOptional()
  generation?: number;
}
