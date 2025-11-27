import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdatePokemonDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  image?: string;
}
