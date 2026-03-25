import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  async subscribe(@Request() req: any, @Body() body: { planType: string }) {
    if (!['Monthly', 'Yearly'].includes(body.planType)) {
      return { error: 'Invalid plan type' };
    }
    return this.subscriptionService.createSubscription(req.user._id, body.planType);
  }

  @Get('me')
  async getMySubscription(@Request() req: any) {
    return this.subscriptionService.getMySubscription(req.user._id);
  }
}
