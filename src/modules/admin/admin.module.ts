import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AdminReportsController } from './controllers/admin-reports.controller';
import { AdminReportsService } from './services/admin-reports.service';
import { Doctor } from '../users/entities/doctor.entity';
import { Procedure } from '../procedures/entities/procedure.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Schedule, Appointment, Doctor, Procedure])],
	controllers: [AdminReportsController],
	providers: [AdminReportsService],
})
export class AdminModule {}
