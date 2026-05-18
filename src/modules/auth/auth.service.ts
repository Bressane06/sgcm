import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { compareSync } from 'bcrypt';
import { UsersService } from '../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserToken } from './models/user-token.model';
import { UserPayload } from './models/user-payload.model';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(user: User): Promise<UserToken> {
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      type: user.type,
    };

    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer',
    };
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email, true);

    if (user) {
      const isPasswordValid = compareSync(pass, user.password);
      if (isPasswordValid) {
        const { password, ...result } = user;
        return result as User;
      }
    }

    return null;
  }
}
