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

    /**
     * saltRound - кількість раундів (ітерацій) хешування, які використовує bcrypt для генерації
     * "солі" (salt) і хешу. Чим більше значення, тим складніше і повільніше підбирати пароль
     * перебором. Його основна функція — зробити хешування більш захищеним від атак перебором
     * (brute-force), а не "уніфікувати" пароль.
     *
     * Сіль (salt) — це випадковий рядок, який додається до пароля перед хешуванням, щоб навіть
     * однакові паролі мали різні хеші.
     */
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

    /**
     * signAsync/sign - методи що створюють (підписують) JWT токен, беручи payload
     * (наприклад, { sub, email }) і кодуючи його у форматі JWT. Далі підисують секретним ключем
     * (щоб токен не можна було підробити). Результатом є рядок-токен, що відправляється клієнту.
     * Клієнт потім надсилає цей токен у заголовку Authorization, а сервер може перевірити
     * підпис і payload.
     */
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
    };
  }
}
