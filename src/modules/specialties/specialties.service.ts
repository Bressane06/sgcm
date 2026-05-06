import { Injectable, Query } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { FindSpecialtiesQueryDto } from './dto/find-specialties-query.dto';
import { Specialty } from './entities/specialty.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { NotFoundException } from '../../common';
import { Doctor } from '../users/entities/doctor.entity';
import { FindDoctorsQueryDto } from '../users/dto/find-doctors-query.dto';

@Injectable()
export class SpecialtiesService {
  constructor(
    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async create(dto: CreateSpecialtyDto): Promise<Specialty> {
    const specialty = this.specialtyRepository.create({
      name: dto.name,
      description: dto.description
    });

    const saved = await this.specialtyRepository.save(specialty);
    return saved;
  }

  async findAll(
    query: FindSpecialtiesQueryDto
  ): Promise<PaginatedResponseDto<Specialty>> { 
    const {page, limit, sort, search} = query;

    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['id', 'ASC'];

    const where = search      ? [
          { name: Like(`%${search}%`) },
          { description: Like(`%${search}%`) },
        ]
      : undefined;
    
    const [specialties, totalItems] = await this.specialtyRepository.findAndCount({
      where,
      order: { [field]: direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC' },
      skip,
      take: limit,
    });

    return {
      data: specialties,
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      }
    };
  }

  async findOne(id: number) {
    const specialty = await this.specialtyRepository.findOne({
      where: { id },
    });
    
    if (!specialty) {
      throw new NotFoundException('Especialidade', id);
    }
    return specialty;
  }

  async update(id: number, updateSpecialtyDto: UpdateSpecialtyDto) {
    const specialty = await this.findOne(id);

    Object.assign(specialty, updateSpecialtyDto);

    return this.specialtyRepository.save(specialty);
  }

  async remove(id: number) {
    const specialty = await this.findOne(id);

    return this.specialtyRepository.remove(specialty);
  }

  async findDoctors(query: FindDoctorsQueryDto, id: number): Promise<PaginatedResponseDto<Specialty>> {
    const { page, limit, sort, search } = query;

    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['id', 'ASC'];

    const doctors = await this.specialtyRepository
      .createQueryBuilder('specialty')

      .innerJoin('specialty.doctors', 'doctorSpecialty')
      .innerJoin('doctorSpecialty.doctorId', 'doctor')
      .innerJoinAndSelect('doctor.user', 'user')

      .where('specialty.id = :id', { id })
      .andWhere('user.name LIKE :search OR user.email LIKE :search', { search: `%${search}%` })

      .orderBy(`doctor.${field}`, direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC')
      .skip(skip)
      .limit(limit)
      
      .getMany();

    if (!doctors) {
      throw new NotFoundException('Especialidade', id);
    }

    const totalItems = doctors.length;

    return {
      data: doctors,
      meta: {
        totalItems,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(totalItems / query.limit),
      }
    };
  }
}
