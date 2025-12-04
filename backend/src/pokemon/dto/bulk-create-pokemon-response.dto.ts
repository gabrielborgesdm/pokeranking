import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PokemonResponseDto } from './pokemon-response.dto';

export class BulkCreatePokemonItemDto {
  @Expose()
  @ApiProperty({
    description: 'Index in the original request array',
    example: 0,
  })
  index: number;

  @Expose()
  @ApiProperty({
    description: 'Pokemon name attempted',
    example: 'Pikachu',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'Whether creation succeeded',
    example: true,
  })
  success: boolean;

  @Expose()
  @ApiPropertyOptional({
    type: PokemonResponseDto,
    description: 'Created Pokemon data if successful',
  })
  @Type(() => PokemonResponseDto)
  pokemon?: PokemonResponseDto;

  @Expose()
  @ApiPropertyOptional({
    description: 'Error message if failed',
    example: 'Pokemon with name "Pikachu" already exists',
  })
  error?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Error code (e.g., NAME_EXISTS)',
    example: 'NAME_EXISTS',
  })
  errorCode?: string;
}

export class BulkCreatePokemonResponseDto {
  @Expose()
  @ApiProperty({
    type: [BulkCreatePokemonItemDto],
    description: 'Results for each Pokemon creation attempt',
  })
  results: BulkCreatePokemonItemDto[];

  @Expose()
  @ApiProperty({
    description: 'Number of successful creations',
    example: 3,
  })
  successCount: number;

  @Expose()
  @ApiProperty({
    description: 'Number of failed creations',
    example: 1,
  })
  failedCount: number;
}
