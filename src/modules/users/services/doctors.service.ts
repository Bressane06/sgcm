import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './../entities/doctor.entity';
import { Like, Repository } from 'typeorm';
import { FindDoctorsQueryDto } from '../dto/find-doctors-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';

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

  findOne(id: number) {
    return `this action returns a #${id} doctor`;
  }
}
