import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getUser(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async getMe(userId: string) {
    const me = await this.userModel.findById(userId);

    if (!me) {
      throw new NotFoundException(`Profile with ID ${userId} not found`);
    }

    return me;
  }

  async updateMe(userId: string, updateMeDto: UpdateMeDto) {
    const updateMe = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateMeDto },
      { new: true },
    );

    if (!updateMe) {
      throw new BadRequestException(
        `Couldn't update profile with ID ${userId}`,
      );
    }

    return updateMe;
  }
}
