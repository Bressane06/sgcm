import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { Repository, Like } from 'typeorm';
import { ForbiddenException, NotFoundException } from '../../../common/exceptions';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';
import { FindPatientsQueryDto } from '../dto/find-patients-query.dto';
import { SchedulesService } from '../../schedules/services/schedules.service';
import type { UserPayload } from '../../auth/models/user-payload.model';
import { UserType } from '../enum/user-type.enum';
import { FindRelatedSchedulesQueryDto } from '../../schedules/dto/find-related-schedules-query.dto';
import { FindAppointmentsQueryDto } from '../../appointments/dto/find-appointments-query.dto';
import { AppointmentsService } from '../../appointments/appointments.service';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly schedulesService: SchedulesService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  async findAll(
    query: FindPatientsQueryDto,
  ): Promise<PaginatedResponse<Patient>> {
    const { page, limit, sort, search } = query;

    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['id', 'ASC'];

    const where = search
      ? [
          { user: { name: Like(`%${search}%`), isActive: true } },
          { user: { email: Like(`%${search}%`), isActive: true } },
        ]
      : { user: { isActive: true } };

    const [patients, totalItems] = await this.patientRepository.findAndCount({
      where,
      relations: { user: true },
      order: { [field]: direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC' },
      skip,
      take: limit,
    });

    return {
      data: patients,
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  private async findEntityByIdOrFail(id: number): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!patient || !patient.user.isActive) {
      throw new NotFoundException('Paciente', id);
    }

    return patient;
  }

  async findOne(id: number) {
    const patient = await this.findEntityByIdOrFail(id);

    return {
      id: patient.id,
      userId: patient.user.id,
      name: patient.user.name,
      email: patient.user.email,
      cpf: patient.cpf,
      birthDate: patient.birthDate,
    };
  }

  async findSchedules(
    id: number,
    query: FindRelatedSchedulesQueryDto,
    currentUser: UserPayload,
  ) {
    const patient = await this.findEntityByIdOrFail(id);
    this.assertCanAccessPatient(patient, currentUser);

    return this.schedulesService.findByPatient(patient.id, query);
  }

  // Controle de Acesso

  private assertCanAccessPatient(patient: Patient, currentUser: UserPayload): void {
    if (currentUser.type === UserType.ADMIN) {
      return;
    }

    if (
      currentUser.type === UserType.PATIENT &&
      patient.user.id === currentUser.sub
    ) {
      return;
    }

    throw new ForbiddenException(
      'Você não tem permissão para acessar dados de outro paciente.',
    );
  }

  async findOneWithAccess(id: number, currentUser: UserPayload) {
    const patient = await this.findEntityByIdOrFail(id);
    this.assertCanAccessPatient(patient, currentUser);

    return {
      id: patient.id,
      userId: patient.user.id,
      name: patient.user.name,
      email: patient.user.email,
      cpf: patient.cpf,
      birthDate: patient.birthDate,
    };
  }

  async findAppointments(
    id: number,
    query: FindAppointmentsQueryDto,
    currentUser: UserPayload,
  ) {
    const patient = await this.findEntityByIdOrFail(id);
    this.assertCanAccessPatient(patient, currentUser);

    return this.appointmentsService.findByPatient(patient.id, query);
  }
}
