import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CharityDocument = Charity & Document;

@Schema({ timestamps: true })
export class Charity {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop()
  url: string;

  @Prop({ default: 0 })
  totalContributionsRaised: number;
}

export const CharitySchema = SchemaFactory.createForClass(Charity);
