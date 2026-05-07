import { Injectable } from '@nestjs/common';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { FindSpecialtiesQueryDto } from './dto/find-specialties-query.dto';
import { Specialty } from './entities/specialty.entity';
import { Brackets, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { NotFoundException } from '../../common';
import { FindDoctorsQueryDto } from '../users/dto/find-doctors-query.dto';
import { Doctor } from '../users/entities/doctor.entity';

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

  async findDoctors(query: FindDoctorsQueryDto, id: number): Promise<PaginatedResponseDto<Doctor>> {
    const specialty = await this.specialtyRepository.findOne({ where: { id } });
    if (!specialty) {
      throw new NotFoundException('Especialidade', id);
    }

    const { page, limit, sort, search } = query;
    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['id', 'ASC'];

    const [doctors, totalItems] = await this.doctorRepository
      .createQueryBuilder('doctor')
      .innerJoinAndSelect('doctor.user', 'user')
      .innerJoin('doctor.specialties', 'doctorSpecialty')
      .where('doctorSpecialty.specialtyId = :id', { id })
      .andWhere(
        new Brackets((qb) => {
          if (search) {
            qb.where('user.name LIKE :search', { search: `%${search}%` })
              .orWhere('user.email LIKE :search', { search: `%${search}%` });
          }
        }),
      )
      .orderBy(`doctor.${field}`, direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

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
