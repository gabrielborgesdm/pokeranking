import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'abc123def456...',
    description: 'Password reset token from email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'newSecurePassword123',
    description: 'New password (min 6 characters)',
  })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
