import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsIn, IsString } from 'class-validator';

export const LIKES_COUNT = 'likesCount' as const;

export const RANKING_SORTABLE_FIELDS = [
  LIKES_COUNT,
  'createdAt',
  'pokemonCount',
] as const;

export type RankingSortableField = (typeof RANKING_SORTABLE_FIELDS)[number];

export class RankingQueryDto {
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
    example: LIKES_COUNT,
    description: 'Field to sort by',
    enum: RANKING_SORTABLE_FIELDS,
    default: LIKES_COUNT,
  })
  @IsIn(RANKING_SORTABLE_FIELDS)
  @IsOptional()
  sortBy?: RankingSortableField = LIKES_COUNT;

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
    example: 'favorites',
    description:
      'Filter by ranking title or username (partial match, case-insensitive)',
  })
  @IsString()
  @IsOptional()
  search?: string;
}
