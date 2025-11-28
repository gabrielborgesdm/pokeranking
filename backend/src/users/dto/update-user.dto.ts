import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsBoolean,
  IsUrl,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'john_doe', minLength: 3, maxLength: 30 })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @ApiPropertyOptional({ example: 'newPassword123', minLength: 6 })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  @IsUrl()
  profilePic?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['507f1f77bcf86cd799439011'],
  })
  @IsArray()
  @IsOptional()
  pokemon?: string[];

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.Member })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
