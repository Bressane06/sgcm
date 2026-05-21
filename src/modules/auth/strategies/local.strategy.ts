import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';
import { UserType } from '../../users/enum/user-type.enum';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passReqToCallback: true });
  }

  // quando passReqToCallback é true, o método validate recebe (req, username, password)
  async validate(req: any, email: string, password: string): Promise<User> {
    const type: UserType | undefined = req?.body?.type;
    const user = await this.authService.validateUser(email, password, type);
    if (!user) {
      throw new UnauthorizedException('Email ou senha incorretos.');
    }
    return user;
  }
}
