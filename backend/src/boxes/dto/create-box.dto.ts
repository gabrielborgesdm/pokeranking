import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  IsMongoId,
} from 'class-validator';

export class CreateBoxDto {
  @ApiProperty({
    example: 'My Favorite Water Types',
    description: 'Name of the box',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the box is visible to other users',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiPropertyOptional({
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    description: 'Array of Pokemon IDs in this box',
  })
  @IsArray()
  @IsOptional()
  @IsMongoId({ each: true })
  pokemon?: string[];
}
