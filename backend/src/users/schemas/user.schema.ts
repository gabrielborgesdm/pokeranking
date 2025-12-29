import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../../common/enums/user-role.enum';

@Schema({
  timestamps: true,
  collection: 'users',
})
export class User extends Document {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  })
  email: string;

  @Prop({
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  })
  username: string;

  @Prop({
    required: true,
    select: false,
  })
  password: string;

  @Prop({
    required: false,
    trim: true,
  })
  profilePic?: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Ranking' }],
    default: [],
  })
  rankings: Types.ObjectId[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Box' }],
    default: [],
  })
  boxes: Types.ObjectId[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Ranking' }],
    default: [],
  })
  likedRankings: Types.ObjectId[];

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.Member,
  })
  role: UserRole;

  @Prop({
    default: false,
  })
  isActive: boolean;

  @Prop()
  emailVerificationCode?: string;

  @Prop()
  emailVerificationExpires?: Date;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  @Prop({ default: 0 })
  rankedPokemonCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Compound indexes for paginated users query (leaderboard)
UserSchema.index({ isActive: 1, rankedPokemonCount: -1 });
UserSchema.index({ isActive: 1, username: 1 });
UserSchema.index({ isActive: 1, createdAt: -1 });
