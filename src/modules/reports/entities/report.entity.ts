import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Doctor } from '../../users/entities/doctor.entity';
import { Patient } from '../../users/entities/patient.entity';
import { ReportStatus } from '../enum/report-status.enum';

@Entity('report')
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  appointmentId!: number;

  @ManyToOne(() => Patient, { eager: true })
  @JoinColumn({ name: 'patientId' })
  patient!: Patient;

  @Column()
  patientId!: number;

  @ManyToOne(() => Doctor, { eager: true })
  @JoinColumn({ name: 'doctorId' })
  doctor!: Doctor;

  @Column()
  doctorId!: number;

  @Column({ type: 'varchar' })
  examType!: string;

  @Column({ type: 'text' })
  result!: string;

  @Column({ type: 'varchar', default: ReportStatus.ACTIVE })
  status!: ReportStatus;

  @Column({ unique: true })
  validationCode!: string;

  @Column()
  issuedByUserId!: number;

  @Column({ type: 'integer', nullable: true })
  issuedByDoctorId?: number | null;

  @Column({ type: 'text', nullable: true })
  revokedReason?: string | null;

  @Column({ type: 'datetime', nullable: true })
  revokedAt?: Date | null;

  @Column({ type: 'integer', nullable: true })
  revokedBy?: number | null;

  @CreateDateColumn()
  issuedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}