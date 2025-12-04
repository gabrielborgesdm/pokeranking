import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { transformObjectId } from '../../common/utils/transform.util';
import { POKEMON_TYPE_VALUES, type PokemonType } from '@pokeranking/shared';

@Exclude()
export class PokemonResponseDto {
  @Expose()
  @Transform(transformObjectId)
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @Expose()
  @ApiProperty({ example: 'Pikachu' })
  name: string;

  @Expose()
  @ApiProperty({ example: 'https://example.com/pokemon/pikachu.png' })
  image: string;

  @Expose()
  @ApiProperty({
    example: ['Electric'],
    enum: POKEMON_TYPE_VALUES,
    isArray: true,
  })
  types: PokemonType[];

  @Expose()
  @ApiPropertyOptional({ example: 25 })
  pokedexNumber?: number;

  @Expose()
  @ApiPropertyOptional({ example: 'Mouse Pokémon' })
  species?: string;

  @Expose()
  @ApiPropertyOptional({ example: 0.4 })
  height?: number;

  @Expose()
  @ApiPropertyOptional({ example: 6.0 })
  weight?: number;

  @Expose()
  @ApiPropertyOptional({ example: ['Static', 'Lightning Rod'] })
  abilities?: string[];

  @Expose()
  @ApiPropertyOptional({ example: 35 })
  hp?: number;

  @Expose()
  @ApiPropertyOptional({ example: 55 })
  attack?: number;

  @Expose()
  @ApiPropertyOptional({ example: 40 })
  defense?: number;

  @Expose()
  @ApiPropertyOptional({ example: 50 })
  specialAttack?: number;

  @Expose()
  @ApiPropertyOptional({ example: 50 })
  specialDefense?: number;

  @Expose()
  @ApiPropertyOptional({ example: 90 })
  speed?: number;

  @Expose()
  @ApiPropertyOptional({ example: 1 })
  generation?: number;

  @Expose()
  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-20T15:45:00.000Z' })
  updatedAt: Date;
}
