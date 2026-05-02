import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('doctor')
export class Doctor {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, { cascade: true, eager: true })
  @JoinColumn()
  user!: User;

  @Column({ unique: true })
  crm!: string;
}