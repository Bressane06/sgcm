import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
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

  @Column()
  updatedBy!: Doctor;

  update(diagnosis: string, prescriptions: string, notes: string): void {
    this.diagnosis = diagnosis;
    this.prescriptions = prescriptions;
    this.notes = notes;
  }
}
