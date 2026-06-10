import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Consultation } from './entities/consultation.entity';
import { Exam } from './entities/exam.entity';
import { FollowUp } from './entities/follow-up.entity';
import { Schedule } from '../schedules/entities/schedule.entity';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { ProceduresModule } from '../procedures/procedures.module';
import { Procedure } from '../procedures/entities/procedure.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Consultation,
      Exam,
      FollowUp,
      Schedule,
      Procedure,
    ]),
    ProceduresModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
