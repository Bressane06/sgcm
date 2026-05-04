import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './../entities/doctor.entity';
import { Like, Repository } from 'typeorm';
import { FindDoctorsQueryDto } from '../dto/find-doctors-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { NotFoundException } from '../../../common';
import { create } from 'domain';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async findAll(
    query: FindDoctorsQueryDto,
  ): Promise<PaginatedResponseDto<Doctor>> {
    const { page, limit, sort, search } = query;

    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['id', 'ASC'];

    const where = search
      ? [
          { user: { name: Like(`%${search}%`) } },
          { user: { email: Like(`%${search}%`) } },
        ]
      : undefined;

    const [doctors, totalItems] = await this.doctorRepository.findAndCount({
      where,
      relations: { user: true },
      order: { [field]: direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC' },
      skip,
      take: limit,
    });

    return {
      data: doctors,
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOne(
    id: number,
  ): Promise<{ id: number; name: string; email: string; crm: string }> {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id } },
      relations: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException('Médico', id);
    }

    return {
      id: doctor.user.id,
      name: doctor.user.name,
      email: doctor.user.email,
      crm: doctor.crm,
    };
  }

  findSpecialities(id: number) {
    return `Listar especialidades do médico ${id}`;
  }

  createSpeciality(id: number, createSpecialityDto: any) {
    return `Criar especialidade para o médico ${id} com dados ${createSpecialityDto}`;
  }

  removeSpeciality(id: number, specialityId: number) {
    return `Remover especialidade do médico ${id} com id ${specialityId}`;
  }

  findSchedules(id: number) {
    return `Listar horários disponíveis do médico ${id}`;
  }
}
