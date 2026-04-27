import { ChildEntity, Column } from 'typeorm';
import { User } from './user.entity';
import { UserType } from '../enum/user-type.enum';

@ChildEntity(UserType.PATIENT)
export class Patient extends User {
  @Column({ unique: true, nullable: true })
  cpf: string;

  @Column({ nullable: true })
  birthDate: Date;

  getAge(): number {
    if (!this.birthDate) return 0;

    const today = new Date();
    const birth = new Date(this.birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const diffMonth = today.getMonth() - birth.getMonth();

    if (diffMonth < 0 || (diffMonth === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }
}