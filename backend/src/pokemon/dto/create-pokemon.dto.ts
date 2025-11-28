import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsImageString } from '../../common/validators';

export class CreatePokemonDto {
  @ApiProperty({ example: 'Pikachu' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'pikachu.png',
    description:
      'Pokemon image - either a filename (e.g., "pikachu.png") or a URL from whitelisted domains',
  })
  @IsString()
  @IsNotEmpty()
  @IsImageString()
  image: string;
}
