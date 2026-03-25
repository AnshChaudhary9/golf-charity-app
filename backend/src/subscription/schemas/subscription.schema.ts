import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User | Types.ObjectId;

  @Prop({ enum: ['Monthly', 'Yearly'], required: true })
  planType: string;

  @Prop({ enum: ['Active', 'Inactive', 'Expired'], default: 'Active' })
  status: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  amountPaid: number;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
