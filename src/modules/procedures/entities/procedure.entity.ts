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
import { Appointment } from '../../appointments/entities/appointment.entity';
import { ProcedureType } from '../enum/procedure-type.enum';

@Entity('procedure')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Procedure {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column({ type: 'varchar', name: 'type', update: false })
  type!: ProcedureType;

  @ManyToOne(() => Appointment, { eager: true })
  @JoinColumn({ name: 'appointmentId' })
  appointment!: Appointment;

  @Column()
  appointmentId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
