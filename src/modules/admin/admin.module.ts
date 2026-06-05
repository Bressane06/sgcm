import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from '../schedules/entities/schedule.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AdminReportsController } from './controllers/admin-reports.controller';
import { AdminReportsService } from './services/admin-reports.service';

@Module({
	imports: [TypeOrmModule.forFeature([Schedule, Appointment])],
	controllers: [AdminReportsController],
	providers: [AdminReportsService],
})
export class AdminModule {}
