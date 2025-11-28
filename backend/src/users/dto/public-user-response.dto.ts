import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { transformObjectIdArray } from '../../common/utils/transform.util';

@Exclude()
export class PublicUserResponseDto {
  @Expose()
  @ApiProperty({ example: 'john_doe' })
  username: string;

  @Expose()
  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  profilePic?: string;

  @Expose()
  @Transform(transformObjectIdArray)
  @ApiProperty({ type: [String], example: ['507f1f77bcf86cd799439011'] })
  pokemon: string[];
}
