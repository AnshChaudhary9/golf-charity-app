import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ScoreService } from './score.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionGuard } from '../subscription/subscription.guard';

@UseGuards(JwtAuthGuard)
@Controller('scores')
export class ScoreController {
  constructor(private readonly scoreService: ScoreService) {}

  @UseGuards(SubscriptionGuard)
  @Post('add')
  async addScore(@Request() req: any, @Body('score') score: number) {
    return this.scoreService.addScore(req.user._id, score);
  }

  @Get('me')
  async getMyScores(@Request() req: any) {
    return this.scoreService.getMyScores(req.user._id);
  }
}
