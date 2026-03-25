import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CharityService } from './charity.service';
import { CharityController } from './charity.controller';
import { Charity, CharitySchema } from './schemas/charity.schema';
import { User, UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Charity.name, schema: CharitySchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [CharityController],
  providers: [CharityService],
})
export class CharityModule {}
