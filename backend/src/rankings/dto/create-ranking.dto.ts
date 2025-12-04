import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ValidateNested,
  MinLength,
  MaxLength,
  IsMongoId,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ZoneDto } from './zone.dto';
import { AreZonesNonOverlapping } from '../validators/non-overlapping-zones.validator';
import { ValidTheme } from '../validators/valid-theme.validator';

export class CreateRankingDto {
  @ApiProperty({
    example: 'My Gen 1 Favorites',
    description: 'Title of the ranking list',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    description: 'Ordered array of Pokemon IDs (position = rank)',
  })
  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  pokemon?: string[];

  @ApiPropertyOptional({
    type: [ZoneDto],
    description: 'Customizable zones with intervals and colors',
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ZoneDto)
  @AreZonesNonOverlapping()
  zones?: ZoneDto[];

  @ApiPropertyOptional({
    example: 'fire',
    description: 'Theme ID for the ranking card appearance',
  })
  @IsString()
  @IsOptional()
  @Validate(ValidTheme)
  theme?: string;

  @ApiPropertyOptional({
    example: 'ocean',
    description: 'Background theme ID for the full-page ranking view',
  })
  @IsString()
  @IsOptional()
  @Validate(ValidTheme)
  background?: string;
}
