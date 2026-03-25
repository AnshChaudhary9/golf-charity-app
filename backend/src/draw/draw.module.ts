import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DrawService } from './draw.service';
import { DrawController } from './draw.controller';
import { Draw, DrawSchema } from './schemas/draw.schema';
import { Winner, WinnerSchema } from './schemas/winner.schema';
import { Score, ScoreSchema } from '../score/schemas/score.schema';
import { Subscription, SubscriptionSchema } from '../subscription/schemas/subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Draw.name, schema: DrawSchema },
      { name: Winner.name, schema: WinnerSchema },
      { name: Score.name, schema: ScoreSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
  ],
  controllers: [DrawController],
  providers: [DrawService],
})
export class DrawModule {}
