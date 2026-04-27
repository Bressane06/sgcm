import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { Admin } from '../entities/admin.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { UserType } from '../enum/user-type.enum';

@Injectable()
export class UsersFactoryService {

  create(dto: CreateUserDto): User {
    switch (dto.type) {
      case UserType.ADMIN:
        return Object.assign(new Admin(), dto);

      case UserType.DOCTOR:
        return Object.assign(new Doctor(), dto);

      case UserType.PATIENT:
        return Object.assign(new Patient(), dto);

      default:
        throw new BadRequestException('Tipo inválido');
    }
  }
}