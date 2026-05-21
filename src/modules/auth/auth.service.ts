import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { compareSync, hashSync } from 'bcrypt';
import { UsersService } from '../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserPayload } from './models/user-payload.model';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserType } from '../users/enum/user-type.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async generateTokens(user: User): Promise<AuthResponseDto> {
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      type: user.type,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    user.refreshToken = hashSync(refresh_token, 10);
    await this.usersService.saveRefreshToken(user.id, user.refreshToken);

    return {
      access_token,
      refresh_token,
      token_type: 'Bearer',
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
        throw new UnauthorizedException('Refresh token inválido ou expirado');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  async me(user: User): Promise<User> {
    return user;
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.clearRefreshToken(userId);
  }

  private validateRefreshToken(token: string, hash: string): boolean {
    return compareSync(token, hash);
  }

  async validateUser(email: string, pass: string, type: UserType | undefined): Promise<User | null> {
    const user = await this.usersService.findByEmail(email, true);

    if (user) {
      const isPasswordValid = compareSync(pass, user.password);
      if (isPasswordValid && user.type === type) {
        const { password, ...result } = user;
        return result as User;
      }
    }

    return null;
  }
}
