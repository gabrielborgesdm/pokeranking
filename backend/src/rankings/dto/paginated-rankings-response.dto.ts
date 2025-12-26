import { ApiProperty } from '@nestjs/swagger';
import { RankingListResponseDto } from './ranking-response.dto';

export class PaginatedRankingsResponseDto {
  @ApiProperty({ type: [RankingListResponseDto] })
  data: RankingListResponseDto[];

  @ApiProperty({ example: 100, description: 'Total number of rankings' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 20, description: 'Number of items per page' })
  limit: number;
}
