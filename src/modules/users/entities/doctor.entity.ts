import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { User } from './user.entity';
import { DoctorSpecialty } from '../../specialties/entities/doctor-specialty.entity';

@Entity('doctor')
export class Doctor {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, { cascade: true, eager: true })
  @JoinColumn()
  user!: User;

  @Column({ unique: true })
  crm!: string;
  
  @OneToMany(() => DoctorSpecialty, doctorSpecialty => doctorSpecialty.doctor)
  specialties!: DoctorSpecialty[];

  // getActiveSchedules(): Schedules[] {}
  // getAppointments(): Appointments[]
}
