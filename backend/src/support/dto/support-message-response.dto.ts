import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { transformObjectId } from '../../common/utils/transform.util';

@Exclude()
export class SupportMessageResponseDto {
  @Expose()
  @Transform(transformObjectId)
  @ApiProperty({ description: 'The message ID' })
  _id: string;

  @Expose()
  @ApiProperty({ description: 'The message content' })
  message: string;

  @Expose()
  @ApiProperty({ description: 'When the message was created' })
  createdAt: Date;
}
