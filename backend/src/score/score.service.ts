import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Score, ScoreDocument } from './schemas/score.schema';

@Injectable()
export class ScoreService {
  constructor(@InjectModel(Score.name) private scoreModel: Model<ScoreDocument>) {}

  async addScore(userId: string, newScore: number) {
    if (newScore < 1 || newScore > 45) {
      throw new BadRequestException('Score must be between 1 and 45');
    }

    let scoreDoc = await this.scoreModel.findOne({ user: userId });
    if (!scoreDoc) {
      scoreDoc = await this.scoreModel.create({ user: new Types.ObjectId(userId) as any, scores: [] });
    }

    if (scoreDoc.scores.includes(newScore)) {
      throw new BadRequestException(`Score ${newScore} is already active in your last 5 scores. You cannot submit it again until it rolls off.`);
    }

    // Add exactly at the end. The constraint is last 5 scores.
    scoreDoc.scores.push(newScore);
    if (scoreDoc.scores.length > 5) {
      // Remove the oldest (first element)
      scoreDoc.scores.shift();
    }
    
    await scoreDoc.save();
    return scoreDoc;
  }

  async getMyScores(userId: string) {
    const scoreDoc = await this.scoreModel.findOne({ user: userId });
    if (!scoreDoc) return { scores: [] };
    
    // Return in reverse chronological order (newest first)
    return { scores: [...scoreDoc.scores].reverse() };
  }
}
