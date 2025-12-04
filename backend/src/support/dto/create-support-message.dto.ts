import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateSupportMessageDto {
  @ApiProperty({
    description: 'The feedback message',
    minLength: 10,
    maxLength: 2000,
    example: 'I would love to see a dark mode feature in the app!',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message: string;
}
