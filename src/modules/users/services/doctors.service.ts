import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './../entities/doctor.entity';
import { Like, Repository } from 'typeorm';
import { FindDoctorsQueryDto } from '../dto/find-doctors-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { NotFoundException } from '../../../common';
import { Specialty } from '../../specialties/entities/specialty.entity';
import { DoctorSpecialty } from '../../specialties/entities/doctor-specialty.entity';
import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { FindSpecialtiesBodyDto } from '../../specialties/dto/find-specialties-body.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,
    @InjectRepository(DoctorSpecialty)
    private readonly doctorSpecialtyRepository: Repository<DoctorSpecialty>,
  ) {}

  async findAll(
    query: FindDoctorsQueryDto,
  ): Promise<PaginatedResponseDto<Doctor>> {
    const { page, limit, sort, search } = query;

    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['id', 'ASC'];

    const where = search
      ? [
          { user: { name: Like(`%${search}%`) } },//PENDENTE: adicionar filtro por especialidade
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

  async findSpecialties( query: FindDoctorsQueryDto, id: number) {
    const { page, limit, sort, search } = query;

    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['id', 'ASC'];

    const doctor = await this.doctorRepository.findOne({
      where: { user: { id } },
      relations: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException('Médico', id);
    }

    const specialties = await this.doctorRepository
      .createQueryBuilder('doctor')

      .innerJoin('doctor.specialties', 'doctorSpecialty')
      .innerJoinAndSelect('doctorSpecialty.specialtyId', 'specialty')

      .where('doctor.id = :id', { id })
      .andWhere('specialty.name LIKE :search OR specialty.description LIKE :search', { search: `%${search}%` })

      .orderBy(`specialty.${field}`, direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC')
      .skip(skip)
      .limit(limit)
      
      .getMany();

    if (!specialties) {
      throw new NotFoundException('Doctor', id);
    }

    const totalItems = specialties.length;

    return {
      data: specialties,
      meta: {
        totalItems,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(totalItems / query.limit),
      }
    };
  }

  async associateSpecialty(idDoctor: number, specialtyDto: FindSpecialtiesBodyDto) {
    if (!specialtyDto?.name) {
      throw new NotFoundException('Especialidade', 'Nome não fornecido');
    }

    const specialty = await this.specialtyRepository.findOne({ where: { name: specialtyDto.name } })
    if (!specialty) {
      throw new NotFoundException('Especialidade', specialtyDto.name);
    }

    const doctor = await this.doctorRepository.findOne({
      where: { id: idDoctor },
      relations: { user: true }
    });
    if (!doctor) {
      throw new NotFoundException('Médico', idDoctor);
    }

    const doctorSpecialtyExists = await this.doctorSpecialtyRepository.findOne({
      where: { specialtyId: specialty.id, doctorId: doctor.id } });
    if (doctorSpecialtyExists) {
      throw ConflictException.businessRule(
        `O médico ${doctor.user.name} já possui a especialidade ${specialty.name}`);
    }

    const doctorSpecialty = this.doctorSpecialtyRepository.create({
      specialtyId: specialty.id,
      doctorId: doctor.id
    });

    await this.doctorSpecialtyRepository.save(doctorSpecialty);

    return;
  }

  async dessociateSpecialty(id: number, specialtyId: number) {
    const doctorSpecialty = await this.doctorSpecialtyRepository.findOne({
      where: { specialtyId, doctorId: id } });
    if (!doctorSpecialty) {
      throw new NotFoundException('Associação entre médico e especialidade', `Médico ID: ${id}, Especialidade ID: ${specialtyId}`);
    }

    const specialty = await this.specialtyRepository.findOne({ where: { id: specialtyId } })
    if (!specialty) {
      throw new NotFoundException('Especialidade', specialtyId);//PENDENTE
    }

    const doctor = await this.doctorRepository.findOne({ where: { id: id } });
    if (!doctor) {
      throw new NotFoundException('Médico', id);
    }
  
    // Remover a associação da especialidade no médico, o filter ja resolve pq existe apenas uma associação entre médico e especialidade
    specialty.doctors = specialty.doctors?.filter(ds => ds.doctorId !== id);
    await this.specialtyRepository.save(specialty);

    doctor.specialties = doctor.specialties?.filter(ds => ds.specialtyId !== specialtyId);
    await this.doctorRepository.save(doctor);

    await this.doctorSpecialtyRepository.remove(doctorSpecialty);

    return;
  }

  findSchedules(id: number) {
    return `Listar horários disponíveis do médico ${id}`;
  }
}
