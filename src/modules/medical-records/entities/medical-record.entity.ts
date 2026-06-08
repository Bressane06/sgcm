import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../../users/entities/patient.entity';
import { Exam } from '../../appointments/entities/exam.entity';
import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../users/entities/doctor.entity';

@Entity('medical_record')
export class MedicalRecord {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  diagnosis!: string;

  @Column()
  prescriptions!: string;

  @Column()
  notes!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'updatedBy' })
  updatedBy!: User;

  @ManyToOne(() => Doctor, { nullable: false })
  @JoinColumn({ name: 'createdBy' })
  createdBy!: Doctor;

  @ManyToOne(() => Patient, { nullable: false })
  @JoinColumn({ name: 'patientId' })
  patient!: Patient;

  @OneToOne(() => Exam, { nullable: false })
  appointmentId!: number;

  update(diagnosis: string, prescriptions: string, notes: string): void {
    this.diagnosis = diagnosis;
    this.prescriptions = prescriptions;
    this.notes = notes;
  }
}
