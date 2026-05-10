import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Admin } from './entities/admin.entity';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersFactoryService } from './services/users-factory.service';
import { UsersUniquenessService } from './services/users-uniqueness.service';
import { PatientsController } from './controllers/patients.controller';
import { PatientsService } from './services/patients.service';
import { DoctorsController } from './controllers/doctors.controller';
import { DoctorsService } from './services/doctors.service';
import { SpecialtiesModule } from '../specialties/specialties.module';
import { Specialty } from '../specialties/entities/specialty.entity';
import { DoctorSpecialty } from '../specialties/entities/doctor-specialty.entity';
import { SchedulesModule } from '../schedules/schedules.module';
import { Schedule } from '../schedules/entities/schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Admin,
      Doctor,
      Patient,
      Specialty,
      DoctorSpecialty,
      Schedule,
    ]),
    SpecialtiesModule,
    SchedulesModule,
  ],
  controllers: [UsersController, PatientsController, DoctorsController],
  providers: [
    UsersService,
    PatientsService,
    UsersFactoryService,
    UsersUniquenessService,
    DoctorsService,
  ],
  exports: [UsersService, DoctorsService, PatientsService],
})
export class UsersModule {}
