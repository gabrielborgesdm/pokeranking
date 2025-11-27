import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreatePokemonDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  image: string;
}
