import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray, ArrayMinSize } from 'class-validator';
import { CreatePokemonDto } from './create-pokemon.dto';

export class BulkCreatePokemonDto {
  @ApiProperty({
    type: [CreatePokemonDto],
    description: 'Array of Pokemon to create',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePokemonDto)
  pokemon: CreatePokemonDto[];
}
