import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { Admin } from '../entities/admin.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { User } from '../entities/user.entity';
import { UserType } from '../enum/user-type.enum';
import { ValidationException } from '../../../common/exceptions';
@Injectable()
export class UsersFactoryService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    switch (dto.type) {
      case UserType.ADMIN: {
        return this.adminRepository.save(
          this.adminRepository.create({
            name: dto.name,
            email: dto.email,
            password: dto.password,
            type: dto.type,
            accessLevel: dto.accessLevel,
          }),
        );
      }
      case UserType.DOCTOR: {
        return this.doctorRepository.save(
          this.doctorRepository.create({
            name: dto.name,
            email: dto.email,
            password: dto.password,
            type: dto.type,
            crm: dto.crm,
          }),
        );
      }
      case UserType.PATIENT: {
        return this.patientRepository.save(
          this.patientRepository.create({
            name: dto.name,
            email: dto.email,
            password: dto.password,
            type: dto.type,
            cpf: dto.cpf,
            birthDate: dto.birthDate,
          }),
        );
      }
      default:
        throw new ValidationException('Tipo de usuário inválido.', {
          type: ['Deve ser um dos tipos válidos: ADMIN, DOCTOR ou PATIENT'],
        });
    }
  }
}