// Isso foi feito para centralizar a lógica de verificação de
// unicidade de campos como email, CRM e CPF, evitando duplicação
// de código entre os serviços de criação e atualização de usuários.

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '../../../common/exceptions';
import { User } from '../entities/user.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { UserType } from '../enum/user-type.enum';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersUniquenessService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  // Verifica se o email é único, considerando o ID do usuário atual para atualizações
  private async assertUniqueEmail(
    email?: string,
    currentUserId?: number,
  ): Promise<void> {
    if (!email) return;

    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser && existingUser.id !== currentUserId) {
      throw new ConflictException(`email "${email}" já existe`);
    }
  }

  // Verifica se o CRM é único para médicos, considerando o ID do usuário atual para atualizações
  private async assertUniqueDoctorCrm(
    crm?: string,
    currentUserId?: number,
  ): Promise<void> {
    if (!crm) return;

    const existingDoctor = await this.doctorRepository.findOneBy({ crm });
    if (existingDoctor && existingDoctor.id !== currentUserId) {
      throw new ConflictException(`CRM "${crm}" já existe`);
    }
  }

  // Verifica se o CPF é único para pacientes, considerando o ID do usuário atual para atualizações
  private async assertUniquePatientCpf(
    cpf?: string,
    currentUserId?: number,
  ): Promise<void> {
    if (!cpf) return;

    const existingPatient = await this.patientRepository.findOneBy({ cpf });
    if (existingPatient && existingPatient.id !== currentUserId) {
      throw new ConflictException(`CPF "${cpf}" já existe`);
    }
  }

  // Método público para validar os campos de unicidade com base no tipo de usuário
  async validateUniqueFields(
    payload: Pick<
      CreateUserDto | UpdateUserDto,
      'email' | 'crm' | 'cpf' | 'type'
    >,
    currentUserId?: number,
  ): Promise<void> {
    await this.assertUniqueEmail(payload.email, currentUserId);

    if (payload.type === UserType.DOCTOR) {
      await this.assertUniqueDoctorCrm(payload.crm, currentUserId);
    }

    if (payload.type === UserType.PATIENT) {
      await this.assertUniquePatientCpf(payload.cpf, currentUserId);
    }
  }
}
