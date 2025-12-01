import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'boxes',
})
export class Box extends Document {
  @Prop({
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100,
  })
  name: string;

  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    index: true,
  })
  user: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  ownerUsername: string;

  @Prop({
    required: true,
    default: false,
  })
  isPublic: boolean;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Pokemon' }],
    default: [],
  })
  pokemon: Types.ObjectId[];

  @Prop({
    type: Number,
    default: 0,
    min: 0,
  })
  favoriteCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export const BoxSchema = SchemaFactory.createForClass(Box);

// Indexes for efficient queries
BoxSchema.index({ user: 1, createdAt: -1 }); // User's boxes sorted by creation
BoxSchema.index({ isPublic: 1, favoriteCount: -1 }); // Community boxes sorted by popularity
BoxSchema.index({ name: 1, user: 1 }); // For unique name validation per user
BoxSchema.index({ name: 'text' }); // For text search on name
