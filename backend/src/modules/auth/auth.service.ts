import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { User } from '../../common/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthDto, GoogleUserDto } from './dto/google-auth.dto';
import { TelegramAuthDto } from './dto/telegram-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // REQ-1.4: Hash passwords using bcrypt with salt rounds 10
  async register(dto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    await this.userRepository.save(user);
    const token = this.generateToken(user);
    return { accessToken: token, user };
  }

  // REQ-1.1: Verify credentials
  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { accessToken: token, user };
  }

  // REQ-2: Google OAuth
  async googleLogin(dto: GoogleAuthDto) {
    const googleUser = await this.verifyGoogleToken(dto.token);

    let user = await this.userRepository.findOne({ where: { email: googleUser.email } });

    if (!user) {
      user = this.userRepository.create({
        email: googleUser.email,
        name: googleUser.name,
        oauthProvider: 'google',
        oauthId: googleUser.googleId,
        profilePicture: googleUser.picture,
      });
      await this.userRepository.save(user);
    } else if (user.oauthProvider && user.oauthProvider !== 'google') {
      throw new UnauthorizedException('Account exists with different provider');
    } else {
      user.oauthId = googleUser.googleId;
      user.profilePicture = googleUser.picture;
      await this.userRepository.save(user);
    }

    const token = this.generateToken(user);
    return { accessToken: token, user };
  }

  // REQ-3: Telegram OAuth
  async telegramLogin(dto: TelegramAuthDto) {
    const isValid = await this.verifyTelegramAuth(dto);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Telegram authentication');
    }

    const telegramId = dto.id.toString();
    let user = await this.userRepository.findOne({ where: { oauthId: telegramId, oauthProvider: 'telegram' } });

    const name = `${dto.first_name}${dto.last_name ? ' ' + dto.last_name : ''}`;

    if (!user) {
      user = this.userRepository.create({
        email: dto.username ? `${dto.username}@telegram.local` : `${telegramId}@telegram.local`,
        name,
        oauthProvider: 'telegram',
        oauthId: telegramId,
        profilePicture: dto.photo_url || null,
      });
      await this.userRepository.save(user);
    } else {
      user.name = name;
      user.profilePicture = dto.photo_url || user.profilePicture;
      await this.userRepository.save(user);
    }

    const token = this.generateToken(user);
    return { accessToken: token, user };
  }

  async logout() {
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private generateToken(user: User): string {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }

  private async verifyGoogleToken(token: string): Promise<GoogleUserDto> {
    try {
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
      );

      const { email, name, picture, sub: googleId, aud } = response.data;
      const clientId = this.configService.get<string>('googleOAuth.clientId');

      if (clientId && aud !== clientId) {
        throw new UnauthorizedException('Invalid token audience');
      }

      return { email, name, picture, googleId };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  private async verifyTelegramAuth(authData: TelegramAuthDto): Promise<boolean> {
    const { hash, ...data } = authData;
    const botToken = this.configService.get<string>('telegram.botToken');

    if (!botToken) {
      return false;
    }

    // Create data check string
    const dataCheckString = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`)
      .join('\n');

    // Create secret key from bot token
    const secretKey = crypto.createHash('sha256').update(botToken).digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Verify hash matches
    if (calculatedHash !== hash) {
      return false;
    }

    // Verify timestamp (within 24 hours)
    const authDate = parseInt(authData.auth_date.toString());
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      return false;
    }

    return true;
  }
}
