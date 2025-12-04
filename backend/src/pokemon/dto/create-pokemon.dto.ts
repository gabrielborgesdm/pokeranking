import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsIn,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsImageString } from '../../common/validators';
import { POKEMON_TYPE_VALUES, type PokemonType } from '@pokeranking/shared';

export class CreatePokemonDto {
  @ApiProperty({ example: 'Pikachu' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'pikachu.png',
    description:
      'Pokemon image - either a filename (e.g., "pikachu.png") or a URL from whitelisted domains',
  })
  @IsString()
  @IsNotEmpty()
  @IsImageString()
  image: string;

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
