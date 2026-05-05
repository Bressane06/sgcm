import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('patient')
export class Patient {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, { cascade: true, eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  user!: User;

  @Column({ unique: true })
  cpf!: string;

  @Column({ })
  birthDate!: Date;

  getAge(): number {
    if (!this.birthDate) return 0;
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const diffMonth = today.getMonth() - birth.getMonth();
    if (
      diffMonth < 0 ||
      (diffMonth === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  }
}
