import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScoreService } from './score.service';
import { ScoreController } from './score.controller';
import { Score, ScoreSchema } from './schemas/score.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Subscription, SubscriptionSchema } from '../subscription/schemas/subscription.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Score.name, schema: ScoreSchema },
      { name: User.name, schema: UserSchema },
      { name: Subscription.name, schema: SubscriptionSchema }
    ])
  ],
  controllers: [ScoreController],
  providers: [ScoreService],
})
export class ScoreModule {}
