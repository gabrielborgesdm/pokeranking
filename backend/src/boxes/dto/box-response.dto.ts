import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { transformObjectId } from '../../common/utils/transform.util';
import { PokemonResponseDto } from '../../pokemon/dto/pokemon-response.dto';

@Exclude()
export class BoxResponseDto {
  @Expose()
  @Transform(transformObjectId)
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @Expose()
  @ApiProperty({ example: 'My Favorite Water Types' })
  name: string;

  @Expose()
  @ApiProperty({ example: false })
  isPublic: boolean;

  @Expose()
  @Type(() => PokemonResponseDto)
  @ApiProperty({ type: [PokemonResponseDto] })
  pokemon: PokemonResponseDto[];

  @Expose()
  @ApiProperty({ example: 5 })
  favoriteCount: number;

  @Expose()
  @ApiPropertyOptional({
    example: 'john_doe',
    description: 'Username of box creator',
  })
  ownerUsername?: string;

  @Expose()
  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-20T15:45:00.000Z' })
  updatedAt: Date;
}
