import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePokemonDto {
  @ApiProperty({ example: 'Pikachu' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://example.com/pokemon/pikachu.png' })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  image: string;
}
