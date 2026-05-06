import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './../entities/doctor.entity';
import { Brackets, Like, Repository } from 'typeorm';
import { FindDoctorsQueryDto } from '../dto/find-doctors-query.dto';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { NotFoundException } from '../../../common';
import { Specialty } from '../../specialties/entities/specialty.entity';
import { DoctorSpecialty } from '../../specialties/entities/doctor-specialty.entity';
import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { ValidationException } from '../../../common/exceptions/validation.exception';
import { UpdateSpecialtyDto } from '../../specialties/dto/update-specialty.dto';

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

    const doctorSpecialties = await this.doctorSpecialtyRepository
      .createQueryBuilder('ds')
      .innerJoinAndSelect('ds.specialty', 'specialty')
      .where('ds.doctorId = :doctorId', { doctorId: doctor.id })
      .andWhere(
        new Brackets((qb) => {
          if (search) {
            qb.where('specialty.name LIKE :search', { search: `%${search}%` })
              .orWhere('specialty.description LIKE :search', { search: `%${search}%` });
          }
        }),
      )
      .orderBy(`specialty.${field}`, direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC')
      .skip(skip)
      .limit(limit)
      .getMany();

    const specialties = doctorSpecialties.map(ds => ds.specialty);
    const totalItems = doctorSpecialties.length; 

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

  async associateSpecialty(idDoctor: number, specialtyDto: UpdateSpecialtyDto) {
    if (!specialtyDto.name || specialtyDto.name === '') {
      throw new ValidationException('Neste caso, o nome da especialidade é obrigatório');
    }

    const specialty = await this.specialtyRepository.findOne({ where: { name: specialtyDto.name } })
    if (!specialty ) {
      throw new NotFoundException('Especialidade', specialtyDto.name, true);
    }

    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: idDoctor } },
      relations: { user: true }
    });
    if (!doctor) {
      throw new NotFoundException('Médico', idDoctor);
    }

    const doctorSpecialtyExists = await this.doctorSpecialtyRepository.findOne({
      where: { specialtyId: specialty.id, doctorId: doctor.id } });
    if (doctorSpecialtyExists) {
      throw ConflictException.businessRule(
        `O médico ${doctor.user.name} já possui a especialidade ${specialty.name} associada.  `);
    }

    const doctorSpecialty =  this.doctorSpecialtyRepository.create({
      specialtyId: specialty.id,
      doctorId: doctor.id
    });

    console.log(doctorSpecialty);

    return await this.doctorSpecialtyRepository.save(doctorSpecialty);
  }

  async dessociateSpecialty(id: number, specialtyId: number) {
    const doctor = await this.doctorRepository.findOne({ where: { user: { id } }, relations: { specialties: true } });
    if (!doctor) {
      throw new NotFoundException('Médico', id);
    }

    const doctorSpecialty = await this.doctorSpecialtyRepository.findOne({ where: { specialtyId, doctorId: doctor.id } });
    if (!doctorSpecialty) {
      throw new NotFoundException('Associação entre médico e especialidade', `Médico ID: ${id}, Especialidade ID: ${specialtyId}`);
    }

    const specialty = await this.specialtyRepository.findOne({ where: { id: specialtyId }, relations: { doctors: true } })
    if (!specialty) {
      throw new NotFoundException('Especialidade', specialtyId);//PENDENTE
    }

    // Remover a associação da especialidade no médico, o filter ja resolve pq existe apenas uma associação entre médico e especialidade
    specialty.doctors = specialty.doctors?.filter(ds => ds.doctorId !== doctor.id);
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
