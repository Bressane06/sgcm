import { ChildEntity, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { DoctorSpecialty } from '../../specialties/entities/doctor-specialty.entity';
import { Schedule } from '../../schedules/entities/schedule.entity';
import { ScheduleStatus } from '../../schedules/enum/schedule-status.enum';
import { UserType } from '../enum/user-type.enum';

@ChildEntity(UserType.DOCTOR)
export class Doctor extends User {
  @Column({ unique: true, nullable: true })
  crm!: string;

  @OneToMany(() => DoctorSpecialty, ds => ds.doctor, { cascade: true })
  specialties!: DoctorSpecialty[];

  @OneToMany(() => Schedule, schedule => schedule.doctor)
  schedules!: Schedule[];

  getActiveSchedules(): Schedule[] {
    return this.schedules?.filter(s =>
      [ScheduleStatus.PENDING, ScheduleStatus.CONFIRMED].includes(s.status)
    ) ?? [];
  }
}