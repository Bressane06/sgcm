import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';
import { Schedule } from '../../schedules/entities/schedule.entity';
import { AppointmentStatus } from '../enum/appointment-status.enum';
import { AppointmentType } from '../enum/appointment-type.enum';

@Entity('appointment')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Appointment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', default: AppointmentStatus.IN_PROGRESS })
  status!: AppointmentStatus;

  @Column({ type: 'varchar' })
  type!: AppointmentType;

  @OneToOne(() => Schedule, { eager: true })
  @JoinColumn({ name: 'scheduleId' })
  schedule!: Schedule;

  @RelationId((appointment: Appointment) => appointment.schedule)
  scheduleId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
