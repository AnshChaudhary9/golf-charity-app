import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { CharityService } from './charity.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/charities')
export class CharityController {
  constructor(private readonly charityService: CharityService) {}

  @Get()
  async getAllCharities() {
    return this.charityService.getAllCharities();
  }

  @UseGuards(JwtAuthGuard)
  @Post('select/:id')
  async selectCharity(@Request() req: any, @Param('id') charityId: string) {
    return this.charityService.selectCharity(req.user._id, charityId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Post()
  async createCharity(@Body() body: { name: string; description: string }) {
    return this.charityService.createCharity(body.name, body.description);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  @Post('delete/:id')
  async deleteCharity(@Param('id') charityId: string) {
    return this.charityService.deleteCharity(charityId);
  }
}
