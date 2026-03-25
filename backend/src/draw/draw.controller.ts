import { Controller, Post, Body, UseGuards, Param, Put, Get, Req } from '@nestjs/common';
import { DrawService } from './draw.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/draws')
export class DrawController {
  constructor(private readonly drawService: DrawService) {}

  @Roles('Admin')
  @Post('simulate')
  async simulateDraw(@Body('month') month: string) {
    return this.drawService.simulateDraw(month);
  }

  @Roles('Admin')
  @Post('run')
  async runDraw(@Body('month') month: string) {
    return this.drawService.runMonthlyDraw(month);
  }

  @Roles('Admin')
  @Put('verify/:winnerId')
  async verifyWinner(@Param('winnerId') winnerId: string, @Body('status') status: string) {
    return this.drawService.verifyWinner(winnerId, status);
  }

  @Put('winners/:id/proof')
  async uploadProof(@Param('id') winnerId: string, @Body('proofImage') proofImage: string) {
    return this.drawService.uploadProof(winnerId, proofImage);
  }

  @Roles('Admin')
  @Get('winners')
  async getAllWinners() {
    return this.drawService.getAllWinners();
  }

  @Get('my-winnings')
  async getMyWinnings(@Req() req: any) {
    return this.drawService.getMyWinnings(req.user.userId);
  }

  @Roles('Admin')
  @Get('analytics')
  async getAnalytics() {
    return this.drawService.getAnalytics();
  }
}
