import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ZoneResponseDto {
  @Expose()
  @ApiProperty({ example: 'S-Tier' })
  name: string;

  @Expose()
  @ApiProperty({
    example: [1, 5],
    description:
      'Position interval [start, end] where start >= 1. Use null for end to indicate "until the end" (unbounded)',
    type: [Number],
  })
  interval: [number, number | null];

  @Expose()
  @ApiProperty({
    example: '#FF5733',
    description: 'Hex color code',
  })
  color: string;
}
