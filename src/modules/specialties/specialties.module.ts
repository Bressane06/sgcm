import { Module } from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { SpecialtiesController } from './specialties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Specialty } from './entities/specialty.entity';
import { DoctorSpecialty } from './entities/doctor-specialty.entity';
import { Doctor } from '../users/entities/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Specialty, DoctorSpecialty, Doctor])],
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService],
})
export class SpecialtiesModule {}
