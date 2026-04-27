import { ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';
import { UserType } from '../enum/user-type.enum';

@ChildEntity(UserType.ADMIN)
export class Admin extends User {
  @Column({ nullable: true })
  accessLevel: string;
}