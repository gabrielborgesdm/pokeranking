import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePokemonDto {
  @ApiPropertyOptional({ example: 'Pikachu' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'https://example.com/pokemon/pikachu.png' })
  @IsString()
  @IsOptional()
  @IsUrl()
  image?: string;
}
