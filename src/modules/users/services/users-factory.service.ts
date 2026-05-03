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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const userEntity = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      type: dto.type,
    });

    switch (dto.type) {
      case UserType.ADMIN: {
        const admin = this.adminRepository.create({
          user: userEntity,
          accessLevel: dto.accessLevel,
        });
        const saved = await this.adminRepository.save(admin);
        return saved.user;
      }
      case UserType.DOCTOR: {
        const doctor = this.doctorRepository.create({
          user: userEntity,
          crm: dto.crm,
        });
        const saved = await this.doctorRepository.save(doctor);
        return saved.user;
      }
      case UserType.PATIENT: {
        const patient = this.patientRepository.create({
          user: userEntity,
          cpf: dto.cpf,
          birthDate: dto.birthDate,
        });
        const saved = await this.patientRepository.save(patient);
        return saved.user;
      }
      default:
        throw new ValidationException('Tipo de usuário inválido.', {
          type: ['Deve ser um dos tipos válidos: ADMIN, DOCTOR ou PATIENT'],
        });
    }
  }
}
