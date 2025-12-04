import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { DEFAULT_THEME_ID } from '@pokeranking/shared';

// Zone subdocument schema
@Schema({ _id: false })
export class Zone {
  @Prop({
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 50,
  })
  name: string;

  @Prop({
    required: true,
    type: [Number],
    validate: {
      validator: function (interval: number[]) {
        if (interval.length !== 2) return false;

        const [start, end] = interval;
        return start >= 1 && end >= start;
      },
      message:
        'Interval must be [start, end] where start >= 1 and end >= start',
    },
  })
  interval: [number, number];

  @Prop({
    required: true,
    trim: true,
    match: /^#[0-9A-Fa-f]{6}$/,
  })
  color: string; // Hex color format: #RRGGBB
}

export const ZoneSchema = SchemaFactory.createForClass(Zone);

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
    type: [ZoneSchema],
    default: [],
  })
  zones: Zone[];

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
