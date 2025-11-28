import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { transformObjectId } from '../../common/utils/transform.util';

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
  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-20T15:45:00.000Z' })
  updatedAt: Date;
}
