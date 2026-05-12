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
import { Schedule } from '../../schedules/entities/schedule.entity';
import { ScheduleStatus } from '../../schedules/enum/schedule-status.enum';

@Entity('doctor')
export class Doctor {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToOne(() => User, { cascade: true, eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  user!: User;

  @Column({ unique: true })
  crm!: string;
  
  @OneToMany(() => DoctorSpecialty, doctorSpecialty => doctorSpecialty.doctor, { cascade: true })
  specialties!: DoctorSpecialty[];

  @OneToMany(() => Schedule, (schedule) => schedule.doctor)
  schedules!: Schedule[];

  getActiveSchedules(): Schedule[] {
    return (
      this.schedules?.filter((schedule) =>
        [ScheduleStatus.PENDING, ScheduleStatus.CONFIRMED].includes(
          schedule.status,
        ),
      ) ?? []
    );
  }

  // getAppointments(): Appointments[]
}
