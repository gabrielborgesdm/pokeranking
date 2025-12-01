import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsImageString } from '../../common/validators';

export class UpdatePokemonDto {
  @ApiPropertyOptional({ example: 'Pikachu' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'pikachu.png',
    description:
      'Pokemon image - either a filename (e.g., "pikachu.png") or a URL from whitelisted domains',
  })
  @IsString()
  @IsOptional()
  @IsImageString()
  image?: string;
}
