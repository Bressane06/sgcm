import { UserType } from '../../users/enum/user-type.enum';

export interface UserPayload {
  sub: number;
  email: string;
  type: UserType;
  iat?: number;
  exp?: number;
}
