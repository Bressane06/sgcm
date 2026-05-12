import { ChildEntity, Column } from 'typeorm';
import { Schedule } from './schedule.entity';
import { ScheduleType } from '../enum/schedule-type.enum';

@ChildEntity(ScheduleType.IN_PERSON)
export class InPersonSchedule extends Schedule {
  @Column()
  room!: string;

  @Column()
  unit!: string;
}