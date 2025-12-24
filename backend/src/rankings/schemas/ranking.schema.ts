import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { DEFAULT_THEME_ID } from '@pokeranking/shared';

@Schema({
  timestamps: true,
  collection: 'rankings',
})
export class Ranking extends Document {
  @Prop({
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  })
  title: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    index: true,
  })
  user: Types.ObjectId;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Pokemon' }],
    default: [],
  })
  pokemon: Types.ObjectId[];

  @Prop({
    type: String,
    default: DEFAULT_THEME_ID,
    trim: true,
  })
  theme: string;

  @Prop({
    type: String,
    default: null,
    trim: true,
  })
  background: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export const RankingSchema = SchemaFactory.createForClass(Ranking);

// Indexes for efficient queries
RankingSchema.index({ user: 1, createdAt: -1 });
RankingSchema.index({ title: 1 });
