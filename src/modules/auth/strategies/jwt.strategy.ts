import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserPayload } from '../models/user-payload.model';
import { UsersService } from '../../users/services/users.service';
import { UnauthorizedException } from '../../../common/exceptions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: `${process.env.JWT_SECRET}`,
    });
  }

  async validate(payload: UserPayload): Promise<any> {
    try {
      return await this.usersService.findOne(payload.sub);
    } catch (e) {
      throw new UnauthorizedException('Sessão de autenticação inválida.');
    }
  }
}