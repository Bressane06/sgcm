import { Module } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecord } from './entities/medical-record.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord, Appointment])],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
