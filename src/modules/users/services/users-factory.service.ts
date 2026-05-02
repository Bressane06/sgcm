import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { Admin } from '../entities/admin.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { User } from '../entities/user.entity';
import { UserType } from '../enum/user-type.enum';
import { ValidationException } from '../../../common/exceptions';

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
        // Acaba sendo tratado antes pelos ExceptionFilters, mas é bom garantir que o serviço não crie um usuário com tipo inválido
        throw new ValidationException(
          'Tipo de usuário inválido.',
          {
            type: ['Deve ser um dos tipos válidos: ADMIN, DOCTOR ou PATIENT'],
          },
        );
    }
  }
}