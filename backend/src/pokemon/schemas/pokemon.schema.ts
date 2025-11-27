import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

  createdAt: Date;
  updatedAt: Date;
}

export const PokemonSchema = SchemaFactory.createForClass(Pokemon);

// Indexes
PokemonSchema.index({ name: 1 });
