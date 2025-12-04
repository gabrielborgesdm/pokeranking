import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'support_messages',
})
export class SupportMessage extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  username: string;

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000,
  })
  message: string;

  createdAt: Date;
  updatedAt: Date;
}

export const SupportMessageSchema =
  SchemaFactory.createForClass(SupportMessage);

SupportMessageSchema.index({ user: 1, createdAt: -1 });
