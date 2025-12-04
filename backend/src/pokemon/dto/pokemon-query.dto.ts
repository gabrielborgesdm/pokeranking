import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsIn, IsString } from 'class-validator';
import { POKEMON_TYPE_VALUES, type PokemonType } from '@pokeranking/shared';

export const POKEMON_SORTABLE_FIELDS = ['name', 'createdAt'] as const;

export type PokemonSortableField = (typeof POKEMON_SORTABLE_FIELDS)[number];

export class PokemonQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: 'Number of items per page',
    default: 20,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    example: 'name',
    description: 'Field to sort by',
    enum: POKEMON_SORTABLE_FIELDS,
    default: 'name',
  })
  @IsIn(POKEMON_SORTABLE_FIELDS)
  @IsOptional()
  sortBy?: PokemonSortableField = 'name';

  @ApiPropertyOptional({
    example: 'asc',
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsIn(['asc', 'desc'])
  @IsOptional()
  order?: 'asc' | 'desc' = 'asc';

  @ApiPropertyOptional({
    example: 'pikachu',
    description: 'Filter Pokemon by name (partial match, case-insensitive)',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: ['Electric', 'Fire'],
    description:
      'Filter Pokemon by types (returns Pokemon that have ANY of the specified types)',
    enum: POKEMON_TYPE_VALUES,
    isArray: true,
  })
  @Transform(({ value }: { value: unknown }) => {
    // Handle comma-separated string or array
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim());
    }
    return value as string[];
  })
  @IsIn(POKEMON_TYPE_VALUES, { each: true })
  @IsOptional()
  types?: PokemonType[];
}
