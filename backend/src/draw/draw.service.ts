import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Draw, DrawDocument } from './schemas/draw.schema';
import { Winner, WinnerDocument } from './schemas/winner.schema';
import { Score, ScoreDocument } from '../score/schemas/score.schema';
import { Subscription, SubscriptionDocument } from '../subscription/schemas/subscription.schema';

@Injectable()
export class DrawService {
  constructor(
    @InjectModel(Draw.name) private drawModel: Model<DrawDocument>,
    @InjectModel(Winner.name) private winnerModel: Model<WinnerDocument>,
    @InjectModel(Score.name) private scoreModel: Model<ScoreDocument>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async simulateDraw(month: string) {
    const activeSubs = await this.subscriptionModel.find({ status: 'Active' });
    let totalPool = activeSubs.reduce((acc, sub) => acc + sub.amountPaid, 0) * 0.5;

    const previousRollover = await this.drawModel.findOne({ jackpotRolledOver: true, status: 'Completed' }).sort({ createdAt: -1 });
    if (previousRollover && previousRollover.rolloverAmount > 0) {
      totalPool += previousRollover.rolloverAmount;
    }

    let winningNumbers = new Set<number>();
    while (winningNumbers.size < 5) {
      winningNumbers.add(Math.floor(Math.random() * 45) + 1);
    }
    const winNumbersArr = Array.from(winningNumbers);

    const allScores = await this.scoreModel.find();
    const match5: any[] = [];
    const match4: any[] = [];
    const match3: any[] = [];

    for (const scoreDoc of allScores) {
      const matchCount = scoreDoc.scores.filter(s => winNumbersArr.includes(s)).length;
      if (matchCount === 5) match5.push(scoreDoc);
      else if (matchCount === 4) match4.push(scoreDoc);
      else if (matchCount === 3) match3.push(scoreDoc);
    }

    const match5Pool = totalPool * 0.40;
    const match4Pool = totalPool * 0.35;
    const match3Pool = totalPool * 0.25;

    return {
      totalPool, winNumbersArr,
      match5Count: match5.length, match5PrizePerUser: match5.length ? match5Pool / match5.length : 0,
      match4Count: match4.length, match4PrizePerUser: match4.length ? match4Pool / match4.length : 0,
      match3Count: match3.length, match3PrizePerUser: match3.length ? match3Pool / match3.length : 0,
    };
  }

  async runMonthlyDraw(month: string) {
    const activeSubs = await this.subscriptionModel.find({ status: 'Active' });
    let totalPool = activeSubs.reduce((acc, sub) => acc + sub.amountPaid, 0) * 0.5;

    const previousRollover = await this.drawModel.findOne({ jackpotRolledOver: true, status: 'Completed' }).sort({ createdAt: -1 });
    if (previousRollover) {
      totalPool += previousRollover.rolloverAmount;
      previousRollover.jackpotRolledOver = false; // Claimed
      await previousRollover.save();
    }

    let winningNumbers = new Set<number>();
    while (winningNumbers.size < 5) {
      winningNumbers.add(Math.floor(Math.random() * 45) + 1);
    }
    const winNumbersArr = Array.from(winningNumbers);

    const allScores = await this.scoreModel.find();
    const match5: any[] = [];
    const match4: any[] = [];
    const match3: any[] = [];

    for (const scoreDoc of allScores) {
      const matchCount = scoreDoc.scores.filter(s => winNumbersArr.includes(s)).length;
      if (matchCount === 5) match5.push(scoreDoc);
      else if (matchCount === 4) match4.push(scoreDoc);
      else if (matchCount === 3) match3.push(scoreDoc);
    }

    const match5Pool = totalPool * 0.40;
    const buildWinners = async (group: any[], poolPercent: number, matches: number) => {
      if (group.length === 0) return;
      const amountPerPerson = (totalPool * poolPercent) / group.length;
      for (const scoreDoc of group) {
        await this.winnerModel.create({
          draw: draw._id,
          user: scoreDoc.user,
          matches,
          prizeAmount: amountPerPerson,
          paymentStatus: 'Pending Proof'
        });
      }
    };

    const draw = await this.drawModel.create({
      month,
      totalPrizePool: totalPool,
      winningNumbers: winNumbersArr,
      status: 'Completed',
      jackpotRolledOver: match5.length === 0,
      rolloverAmount: match5.length === 0 ? match5Pool : 0
    });

    await buildWinners(match5, 0.40, 5);
    await buildWinners(match4, 0.35, 4);
    await buildWinners(match3, 0.25, 3);

    return draw;
  }

  async verifyWinner(winnerId: string, status: string) {
    const winner = await this.winnerModel.findById(winnerId);
    if (!winner) throw new NotFoundException('Winner not found');
    winner.paymentStatus = status;
    await winner.save();

    // Mock Email Send
    console.log(`[Email Mock]: Sending email to Winner DB ID ${winner.user} - Winner verification status changed to ${status}`);

    return winner;
  }

  async uploadProof(winnerId: string, proofImage: string) {
    const winner = await this.winnerModel.findById(winnerId);
    if (!winner) throw new NotFoundException('Winner not found');
    winner.proofImage = proofImage;
    winner.paymentStatus = 'Pending Approval';
    await winner.save();
    return winner;
  }

  async getAllWinners() {
    return this.winnerModel.find().populate('user', 'name email').populate('draw').exec();
  }

  async getMyWinnings(userId: string) {
    return this.winnerModel.find({ user: userId }).populate('draw').exec();
  }

  async getAnalytics() {
    const activeSubs = await this.subscriptionModel.countDocuments({ status: 'Active' });
    const uniqueUsers = await this.subscriptionModel.distinct('user').exec();
    
    const completedDraws = await this.drawModel.find({ status: 'Completed' });
    const totalPrizePool = completedDraws.reduce((sum, draw) => sum + draw.totalPrizePool, 0);

    return {
      activeSubs,
      totalUsers: uniqueUsers.length,
      totalPrizePool,
      totalCharityContributions: totalPrizePool // 50/50 split
    };
  }
}
