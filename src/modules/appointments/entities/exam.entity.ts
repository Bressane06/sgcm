import { ChildEntity, Column } from 'typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentType } from '../enum/appointment-type.enum';

@ChildEntity(AppointmentType.EXAM)
export class Exam extends Appointment {
  @Column({ nullable: true })
  examName?: string;

  @Column({ nullable: true })
  result?: string;

  @Column({ nullable: true })
  observations?: string;
}
