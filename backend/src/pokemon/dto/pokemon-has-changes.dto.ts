import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min } from 'class-validator';

export class PokemonHasChangesQueryDto {
  @ApiPropertyOptional({
    example: 1706745600000,
    description:
      'Client version timestamp (epoch ms). If not provided, hasChanges will be true.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  version?: number;
}

export class PokemonHasChangesResponseDto {
  @ApiProperty({
    example: false,
    description:
      'Whether the Pokemon data has changed since the provided version',
  })
  hasChanges: boolean;

  @ApiProperty({
    example: 1706745600000,
    description: 'Current version timestamp (epoch ms)',
  })
  currentVersion: number;
}
