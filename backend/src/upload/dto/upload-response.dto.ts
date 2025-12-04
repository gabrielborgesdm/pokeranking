import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UploadResponseDto {
  @Expose()
  @ApiProperty({
    description: 'The URL of the uploaded image',
    example:
      'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/pokemon/abc123.png',
  })
  url: string;
}
