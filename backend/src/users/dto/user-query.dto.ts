import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsIn, IsString } from 'class-validator';

export const RANKED_POKEMON_COUNT = 'rankedPokemonCount' as const;

export const USER_SORTABLE_FIELDS = [
  'username',
  RANKED_POKEMON_COUNT,
  'createdAt',
] as const;

export type UserSortableField = (typeof USER_SORTABLE_FIELDS)[number];

export class UserQueryDto {
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
    example: RANKED_POKEMON_COUNT,
    description: 'Field to sort by',
    enum: USER_SORTABLE_FIELDS,
    default: RANKED_POKEMON_COUNT,
  })
  @IsIn(USER_SORTABLE_FIELDS)
  @IsOptional()
  sortBy?: UserSortableField = RANKED_POKEMON_COUNT;

  @ApiPropertyOptional({
    example: 'desc',
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsIn(['asc', 'desc'])
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    example: 'john',
    description: 'Filter users by username (partial match, case-insensitive)',
  })
  @IsString()
  @IsOptional()
  username?: string;
}
