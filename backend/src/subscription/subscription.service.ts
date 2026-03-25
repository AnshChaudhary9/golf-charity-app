import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription, SubscriptionDocument } from './schemas/subscription.schema';
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name) private subModel: Model<SubscriptionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createSubscription(userId: string, planType: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.activeSubscription) {
      const activeSub = await this.subModel.findById(user.activeSubscription);
      if (activeSub && activeSub.status === 'Active') {
        throw new BadRequestException('User already has an active subscription');
      }
    }

    const startDate = new Date();
    const endDate = new Date();
    const amountPaid = planType === 'Monthly' ? 50 : 500; // Abstract pricing

    if (planType === 'Monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = await this.subModel.create({
      user: user._id,
      planType,
      status: 'Active',
      startDate,
      endDate,
      amountPaid
    });

    user.activeSubscription = subscription._id as Types.ObjectId;
    await user.save();

    console.log(`[Email Mock]: 'Subscription Activated' email sent to ${user.email} for ${planType} plan.`);

    return subscription;
  }

  async getMySubscription(userId: string) {
    const user = await this.userModel.findById(userId).populate('activeSubscription');
    if (!user || !user.activeSubscription) {
      throw new NotFoundException('No active subscription found');
    }
    return user.activeSubscription;
  }
}
