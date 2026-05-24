import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { compareSync, hashSync } from 'bcrypt';
import { UsersService } from '../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './models/user-payload.model';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UnauthorizedException } from '../../common/exceptions';
import { ConfigService } from '@nestjs/config';
import { StringValue } from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private async generateTokens(user: User): Promise<AuthResponseDto> {
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      type: user.type,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<StringValue>('JWT_EXPIRES_IN') ?? '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn:
        this.configService.get<StringValue>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    });

    user.refreshToken = hashSync(refreshToken, 10);
    await this.usersService.saveRefreshToken(user.id, user.refreshToken);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  async login(user: User): Promise<AuthResponseDto> {
    return this.generateTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOne(payload.sub);

      if (!user.refreshToken || !this.validateRefreshToken(refreshToken, user.refreshToken)) {
        throw new UnauthorizedException('O refresh token fornecido é inválido ou já foi utilizado.');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('O refresh token fornecido é inválido ou já foi utilizado.');
    }
  }

  async me(user: UserPayload): Promise<User> {
    return this.usersService.findOne(user.sub);
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.clearRefreshToken(userId);
  }

  private validateRefreshToken(token: string, hash: string): boolean {
    return compareSync(token, hash);
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email, true);

    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = compareSync(pass, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
