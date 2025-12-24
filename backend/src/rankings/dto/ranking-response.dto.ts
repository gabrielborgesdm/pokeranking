import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ZoneResponseDto } from './zone-response.dto';
import { transformObjectId } from '../../common/utils/transform.util';
import { PokemonResponseDto } from '../../pokemon/dto/pokemon-response.dto';
import { DEFAULT_ZONES } from '@pokeranking/shared';

@Exclude()
export class RankingUserResponseDto {
  @Expose()
  @Transform(transformObjectId)
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @Expose()
  @ApiProperty({ example: 'john_doe' })
  username: string;

  @Expose()
  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  profilePic?: string;
}

@Exclude()
export class RankingListResponseDto {
  @Expose()
  @Transform(transformObjectId)
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @Expose()
  @ApiProperty({ example: 'My Gen 1 Favorites' })
  title: string;

  @Expose()
  @ApiProperty({
    example: 'fire',
    description: 'Theme ID for the ranking card',
  })
  theme: string;

  @Expose()
  @ApiProperty({
    type: String,
    example: 'https://example.com/pokemon.png',
    description: 'Image URL of the first pokemon in the ranking',
    nullable: true,
  })
  image: string | null;

  @Expose()
  @ApiProperty({
    example: 151,
    description: 'Number of pokemon in the ranking',
  })
  pokemonCount: number;

  @Expose()
  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-20T15:45:00.000Z' })
  updatedAt: Date;
}

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
  @Transform(() => DEFAULT_ZONES)
  @Type(() => ZoneResponseDto)
  @ApiProperty({ type: [ZoneResponseDto] })
  zones: ZoneResponseDto[];

  @Expose()
  @ApiProperty({
    example: 'fire',
    description: 'Theme ID for the ranking card',
  })
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

  @Expose()
  @Type(() => RankingUserResponseDto)
  @ApiPropertyOptional({ type: RankingUserResponseDto })
  user?: RankingUserResponseDto;
}
