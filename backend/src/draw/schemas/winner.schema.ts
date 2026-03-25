import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';
import { Draw } from './draw.schema';

export type WinnerDocument = Winner & Document;

@Schema({ timestamps: true })
export class Winner {
  @Prop({ type: Types.ObjectId, ref: 'Draw', required: true })
  draw: Draw | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User | Types.ObjectId;

  @Prop({ required: true, min: 3, max: 5 })
  matches: number;

  @Prop({ required: true })
  prizeAmount: number;

  @Prop()
  proofImage: string;

  @Prop({ enum: ['Pending Approval', 'Approved', 'Paid', 'Rejected'], default: 'Pending Approval' })
  paymentStatus: string;
}

export const WinnerSchema = SchemaFactory.createForClass(Winner);
