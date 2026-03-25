import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Charity } from '../../charity/schemas/charity.schema';
import { Subscription } from '../../subscription/schemas/subscription.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ enum: ['User', 'Admin'], default: 'User' })
  role: string;

  @Prop({ type: Types.ObjectId, ref: 'Charity' })
  selectedCharity: Charity | Types.ObjectId;

  @Prop({ default: 10, min: 10 })
  charityContributionPercent: number;

  @Prop({ type: Types.ObjectId, ref: 'Subscription' })
  activeSubscription: Subscription | Types.ObjectId;

  @Prop({ default: false })
  isVerifiedWinner: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
