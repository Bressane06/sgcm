import { ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';
import { UserType } from '../enum/user-type.enum';

@ChildEntity(UserType.DOCTOR)
export class Doctor extends User {
  @Column({ nullable: true })
  crm: string;
}