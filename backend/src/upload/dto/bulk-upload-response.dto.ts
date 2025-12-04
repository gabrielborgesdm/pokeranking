import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BulkUploadItemDto {
  @Expose()
  @ApiProperty({
    description: 'Original filename',
    example: 'pikachu.png',
  })
  filename: string;

  @Expose()
  @ApiProperty({
    description: 'Whether upload succeeded',
    example: true,
  })
  success: boolean;

  @Expose()
  @ApiPropertyOptional({
    description: 'URL if successful',
    example:
      'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/pokemon/abc123.png',
  })
  url?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Error message if failed',
    example: 'Invalid file type',
  })
  error?: string;
}

export class BulkUploadResponseDto {
  @Expose()
  @ApiProperty({
    type: [BulkUploadItemDto],
    description: 'Results for each uploaded file',
  })
  results: BulkUploadItemDto[];

  @Expose()
  @ApiProperty({
    description: 'Number of successful uploads',
    example: 3,
  })
  successCount: number;

  @Expose()
  @ApiProperty({
    description: 'Number of failed uploads',
    example: 1,
  })
  failedCount: number;
}
