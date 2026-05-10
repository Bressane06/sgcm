import { ChildEntity, Column } from 'typeorm';
import { Schedule } from './schedule.entity';
import { ScheduleType } from '../enum/schedule-type.enum';

@ChildEntity(ScheduleType.HOME)
export class HomeSchedule extends Schedule {
  @Column()
  fullAddress!: string;

  @Column({ nullable: true })
  accessNotes?: string;
}