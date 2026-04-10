import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.userModel.findOne({ email });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const saltRound = 10;
    const hashedPassword = await bcrypt.hash(password, saltRound);

    const user = await this.userModel.create({
      email,
      password: hashedPassword,
    });

    return {
      id: user._id,
      email: user.email,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const existingUser = await this.userModel
      .findOne({ email })
      .select('+password');

    if (!existingUser) {
      throw new BadRequestException("User with this email doesn't exist");
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new ForbiddenException('Password do not match');
    }

    const payload = {
      sub: existingUser._id,
      email: existingUser.email,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
    };
  }
}
