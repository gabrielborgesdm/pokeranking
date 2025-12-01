import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { UserRole } from '../../common/enums/user-role.enum';
import { RankingResponseDto } from '../../rankings/dto/ranking-response.dto';

@Exclude()
export class UserResponseDto {
  @Expose()
  @Transform(({ obj }) => {
    const typedObj = obj as { _id?: { toString: () => string } };
    return typedObj._id?.toString();
  })
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  _id: string;

  @Expose()
  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @Expose()
  @ApiProperty({ example: 'john_doe' })
  username: string;

  @Expose()
  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  profilePic?: string;

  @Expose()
  @Type(() => RankingResponseDto)
  @ApiProperty({ type: [RankingResponseDto] })
  rankings: RankingResponseDto[];

  @Expose()
  @ApiProperty({ enum: UserRole, example: UserRole.Member })
  role: UserRole;

  @Expose()
  @ApiProperty({ example: true })
  isActive: boolean;

  @Expose()
  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-20T15:45:00.000Z' })
  updatedAt: Date;
}
