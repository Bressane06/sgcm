import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from '../users/entities/doctor.entity';
import { Patient } from '../users/entities/patient.entity';
import { HomeSchedule } from './entities/home-schedule.entity';
import { InPersonSchedule } from './entities/in-person-schedule.entity';
import { OnlineSchedule } from './entities/online-schedule.entity';
import { Schedule } from './entities/schedule.entity';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './services/schedules.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Schedule,
      InPersonSchedule,
      OnlineSchedule,
      HomeSchedule,
      Doctor,
      Patient,
    ]),
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}