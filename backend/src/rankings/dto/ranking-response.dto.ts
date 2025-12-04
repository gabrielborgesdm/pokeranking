import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ZoneDto } from './zone.dto';
import { transformObjectId } from '../../common/utils/transform.util';
import { PokemonResponseDto } from '../../pokemon/dto/pokemon-response.dto';

@Exclude()
export class RankingResponseDto {
  @Expose()
  @Transform(transformObjectId)
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @Expose()
  @ApiProperty({ example: 'My Gen 1 Favorites' })
  title: string;

  @Expose()
  @Type(() => PokemonResponseDto)
  @ApiProperty({ type: [PokemonResponseDto] })
  pokemon: PokemonResponseDto[];

  @Expose()
  @Type(() => ZoneDto)
  @ApiProperty({ type: [ZoneDto] })
  zones: ZoneDto[];

  @Expose()
  @ApiProperty({ example: 'fire', description: 'Theme ID for the ranking card' })
  theme: string;

  @Expose()
  @ApiProperty({
    type: String,
    example: 'ocean',
    description: 'Background theme ID for the full-page ranking view',
    nullable: true,
  })
  background: string | null;

  @Expose()
  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-20T15:45:00.000Z' })
  updatedAt: Date;
}
