import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { RankingResponseDto } from '../../rankings/dto/ranking-response.dto';

@Exclude()
export class PublicUserResponseDto {
  @Expose()
  @ApiProperty({ example: 'john_doe' })
  username: string;

  @Expose()
  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  profilePic?: string;

  @Type(() => RankingResponseDto)
  @ApiProperty({ type: [RankingResponseDto] })
  rankings: RankingResponseDto[];

  @Expose()
  @ApiProperty({ example: 42, description: 'Total count of ranked pokemon' })
  rankedPokemonCount: number;
}
