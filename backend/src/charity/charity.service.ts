import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Charity, CharityDocument } from './schemas/charity.schema';
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class CharityService {
  constructor(
    @InjectModel(Charity.name) private charityModel: Model<CharityDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getAllCharities() {
    return this.charityModel.find();
  }

  async selectCharity(userId: string, charityId: string) {
    const charity = await this.charityModel.findById(charityId);
    if (!charity) {
        throw new NotFoundException('Charity not found');
    }
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // @ts-ignore
    user.selectedCharity = charity._id;
    await user.save();
    return user;
  }
  
  async createCharity(name: string, description: string) {
    return this.charityModel.create({ name, description });
  }

  async deleteCharity(charityId: string) {
    const charity = await this.charityModel.findByIdAndDelete(charityId);
    if (!charity) {
      throw new NotFoundException('Charity not found');
    }
    return { success: true, deleted: charityId };
  }
}
