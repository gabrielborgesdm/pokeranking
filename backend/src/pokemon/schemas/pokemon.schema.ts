import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { POKEMON_TYPE_VALUES, type PokemonType } from '@pokeranking/shared';

@Schema({
  timestamps: true,
  collection: 'pokemon',
})
export class Pokemon extends Document {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
  })
  image: string;

  @Prop({
    type: [String],
    enum: POKEMON_TYPE_VALUES,
    default: [],
  })
  types: PokemonType[];

  createdAt: Date;
  updatedAt: Date;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);

// Indexes
PokemonSchema.index({ name: 1 });
PokemonSchema.index({ types: 1 });
