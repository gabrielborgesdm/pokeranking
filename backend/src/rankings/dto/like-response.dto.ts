import { ApiProperty } from '@nestjs/swagger';

export class LikeResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether the ranking is now liked',
  })
  isLiked: boolean;

  @ApiProperty({
    example: 43,
    description: 'Updated like count',
  })
  likesCount: number;
}
