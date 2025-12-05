import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  Matches,
  Validate,
} from 'class-validator';
import { ValidInterval } from '../validators/valid-interval.validator';

export class ZoneDto {
  @ApiProperty({ example: 'S-Tier' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: [1, 5],
    description:
      'Position interval [start, end] where start >= 1. Use null for end to indicate "until the end" (unbounded)',
    type: [Number],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @Validate(ValidInterval)
  interval: [number, number | null];

  @ApiProperty({
    example: '#FF5733',
    description: 'Hex color code',
  })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex code (e.g., #FF5733)',
  })
  color: string;
}
