import { ApiProperty } from '@nestjs/swagger';
import { PokemonResponseDto } from './pokemon-response.dto';

export class PaginatedPokemonResponseDto {
  @ApiProperty({ type: [PokemonResponseDto] })
  data: PokemonResponseDto[];

  @ApiProperty({ example: 100, description: 'Total number of Pokemon' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 20, description: 'Number of items per page' })
  limit: number;
}
