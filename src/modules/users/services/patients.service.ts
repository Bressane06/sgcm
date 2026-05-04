import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { Repository, Like } from 'typeorm';
import { NotFoundException } from '../../../common/exceptions';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { FindPatientsQueryDto } from '../dto/find-patients-query.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async findAll(
    query: FindPatientsQueryDto,
  ): Promise<PaginatedResponseDto<any>> {
    const { page, limit, sort, search } = query;

    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['id', 'ASC'];

    const where = search
      ? [
          { user: { name: Like(`%${search}%`) } },
          { user: { email: Like(`%${search}%`) } },
        ]
      : undefined;

    const [patients, totalItems] = await this.patientRepository.findAndCount({
      where,
      relations: { user: true },
      order: { [field]: direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC' },
      skip,
      take: limit,
    });

    const data = patients.map((p) => ({
      id: p.user.id,
      name: p.user.name,
      email: p.user.email,
      cpf: p.cpf,
      birthDate: p.birthDate,
    }));

    return {
      data,
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
      where: { user: { id } },
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
}
