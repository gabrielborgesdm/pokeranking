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

  @Prop({ type: Number })
  pokedexNumber?: number;

  @Prop({ type: String, trim: true })
  species?: string;

  @Prop({ type: Number })
  height?: number;

  @Prop({ type: Number })
  weight?: number;

  @Prop({ type: [String], default: [] })
  abilities?: string[];

  @Prop({ type: Number })
  hp?: number;

  @Prop({ type: Number })
  attack?: number;

  @Prop({ type: Number })
  defense?: number;

  @Prop({ type: Number })
  specialAttack?: number;

  @Prop({ type: Number })
  specialDefense?: number;

  @Prop({ type: Number })
  speed?: number;

  @Prop({ type: Number })
  generation?: number;

  createdAt: Date;
  updatedAt: Date;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);

// Indexes
PokemonSchema.index({ name: 1 });
PokemonSchema.index({ types: 1 });
