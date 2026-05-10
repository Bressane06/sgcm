import { ChildEntity, Column } from 'typeorm';
import { Schedule } from './schedule.entity';
import { ScheduleType } from '../enum/schedule-type.enum';

@ChildEntity(ScheduleType.ONLINE)
export class OnlineSchedule extends Schedule {
  @Column()
  accessLink!: string;

  @Column()
  platform!: string;
}