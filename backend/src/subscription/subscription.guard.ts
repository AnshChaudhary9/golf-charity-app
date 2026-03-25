import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Subscription, SubscriptionDocument } from './schemas/subscription.schema';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Subscription.name) private subModel: Model<SubscriptionDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?._id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const user = await this.userModel.findById(userId);
    if (!user || !user.activeSubscription) {
      throw new ForbiddenException('Active subscription required to perform this action');
    }

    const sub = await this.subModel.findById(user.activeSubscription);
    if (!sub || sub.status !== 'Active') {
      throw new ForbiddenException('Your subscription is inactive or expired');
    }

    // Check expiration
    if (new Date() > new Date(sub.endDate)) {
      sub.status = 'Expired';
      await sub.save();
      throw new ForbiddenException('Your subscription has expired. Please renew.');
    }

    return true;
  }
}
