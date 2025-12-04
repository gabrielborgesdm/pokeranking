import { ApiProperty } from '@nestjs/swagger';

export class PokemonCountResponseDto {
  @ApiProperty({
    example: 1025,
    description: 'Total Pokemon registered in the system',
  })
  totalPokemonCount: number;
}
