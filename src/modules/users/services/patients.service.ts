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

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    private readonly schedulesService: SchedulesService,
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

  async findOne(id: number) {
    const patient = await this.patientRepository.findOne({
      where: { user: { id, isActive: true } },
      relations: { user: true },
    });

    if (!patient) {
      throw new NotFoundException('Paciente', id);
    }

    return {
      id: patient.user.id,
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
    this.assertCanAccessPatient(id, currentUser);
    return this.schedulesService.findByPatient(id, query);
  }

  // Controle de Acesso

  private assertCanAccessPatient(patientUserId: number, currentUser: UserPayload): void {
    if (currentUser.type === UserType.ADMIN) {
      return;
    }

    if (currentUser.type === UserType.PATIENT && currentUser.sub === patientUserId) {
      return;
    }

    throw new ForbiddenException(
      'Você não tem permissão para acessar dados de outro paciente.',
    );
  }

  async findOneWithAccess(id: number, currentUser: UserPayload) {
    this.assertCanAccessPatient(id, currentUser);
    return this.findOne(id);
  }
}
