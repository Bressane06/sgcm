import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Admin } from './entities/admin.entity';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { UsersFactoryService } from './services/users-factory.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Admin, Doctor, Patient])],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersFactoryService
  ],
  exports: [UsersService],
})
export class UsersModule {}