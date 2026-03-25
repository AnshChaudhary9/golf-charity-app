import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DrawDocument = Draw & Document;

@Schema({ timestamps: true })
export class Draw {
  @Prop({ required: true })
  month: string;

  @Prop({ default: 0 })
  totalPrizePool: number;

  @Prop({ type: [Number], default: [] })
  winningNumbers: number[];

  @Prop({ type: Object, default: { match5: 40, match4: 35, match3: 25 } })
  matchDistributions: Record<string, number>;

  @Prop({ default: false })
  jackpotRolledOver: boolean;

  @Prop({ default: 0 })
  rolloverAmount: number;

  @Prop({ enum: ['Pending', 'Completed', 'ResultsPublished'], default: 'Pending' })
  status: string;
}

export const DrawSchema = SchemaFactory.createForClass(Draw);
