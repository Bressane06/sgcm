import { ChildEntity, Column } from 'typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentType } from '../enum/appointment-type.enum';

@ChildEntity(AppointmentType.CONSULTATION)
export class Consultation extends Appointment {
  @Column({ nullable: true })
  reason?: string;

  @Column({ nullable: true })
  diagnosticHypothesis?: string;

  @Column({ nullable: true })
  prescription?: string;
}
