import { ChildEntity, Column } from 'typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentType } from '../enum/appointment-type.enum';

@ChildEntity(AppointmentType.FOLLOW_UP)
export class FollowUp extends Appointment {
  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  nextSteps?: string;
}
