import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { compareSync } from 'bcrypt';
import { UsersService } from '../users/services/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

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
