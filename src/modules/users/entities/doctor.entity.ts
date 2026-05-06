import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  JoinTable
} from 'typeorm';
import { User } from './user.entity';
import { DoctorSpecialty } from '../../specialties/entities/doctor-specialty.entity';
import { join } from 'path';

@Entity('doctor')
export class Doctor {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, { cascade: true, eager: true })
  @JoinColumn()
  user!: User;

  @Column({ unique: true })
  crm!: string;
  
  @OneToMany(() => DoctorSpecialty, doctorSpecialty => doctorSpecialty.doctorId, { cascade: true})
  @JoinTable()
  specialties!: DoctorSpecialty[];

  // getActiveSchedules(): Schedules[] {}
  // getAppointments(): Appointments[]
}
