import { ApiProperty } from '@nestjs/swagger';
import { PublicUserResponseDto } from './public-user-response.dto';

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [PublicUserResponseDto] })
  data: PublicUserResponseDto[];

  @ApiProperty({ example: 100, description: 'Total number of users' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 20, description: 'Number of items per page' })
  limit: number;
}
