import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
} from 'typeorm';
import { Doctor } from '../../users/entities/doctor.entity';
import { Patient } from '../../users/entities/patient.entity';
import { ScheduleStatus } from '../enum/schedule-status.enum';
import { ScheduleType } from '../enum/schedule-type.enum';

@Entity('schedule')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Schedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  scheduledAt!: Date;

  @Column({
    type: 'varchar',
    default: ScheduleStatus.PENDING,
  })
  status!: ScheduleStatus;

  @Column({ type: 'varchar' })
  type!: ScheduleType;

  @ManyToOne(() => Doctor, (doctor) => doctor.schedules, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor!: Doctor;

  @Column()
  doctorId!: number;

  @ManyToOne(() => Patient, { eager: true })
  @JoinColumn({ name: 'patientId' })
  patient!: Patient;

  @Column()
  patientId!: number;

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  cancellationReason?: string;

  @Column({ nullable: true })
  cancelledBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}