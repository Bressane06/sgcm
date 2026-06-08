import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './../entities/doctor.entity';
import { Brackets, Like, Repository } from 'typeorm';
import { FindDoctorsQueryDto } from '../dto/find-doctors-query.dto';
import { PaginatedResponse } from '../../../common/interfaces/paginated-response.interface';
import { NotFoundException } from '../../../common';
import { Specialty } from '../../specialties/entities/specialty.entity';
import { DoctorSpecialty } from '../../specialties/entities/doctor-specialty.entity';
import { ConflictException } from '../../../common/exceptions/conflict.exception';
import { ValidationException } from '../../../common/exceptions/validation.exception';
import { UpdateSpecialtyDto } from '../../specialties/dto/update-specialty.dto';
import { SchedulesService } from '../../schedules/services/schedules.service';
import type { UserPayload } from '../../auth/models/user-payload.model';
import { ForbiddenException } from '../../../common/exceptions';
import { UserType } from '../enum/user-type.enum';
import { FindRelatedSchedulesQueryDto } from '../../schedules/dto/find-related-schedules-query.dto';
import { FindAppointmentsQueryDto } from '../../appointments/dto/find-appointments-query.dto';
import { AppointmentsService } from '../../appointments/appointments.service';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly schedulesService: SchedulesService,
    @InjectRepository(Specialty)
    private readonly specialtyRepository: Repository<Specialty>,
    @InjectRepository(DoctorSpecialty)
    private readonly doctorSpecialtyRepository: Repository<DoctorSpecialty>,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  private async findEntityByIdOrFail(id: number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
    });

    if (!doctor || !doctor.isActive) {
      throw new NotFoundException('Médico', id);
    }

    return doctor;
  }

  async findAll(
    query: FindDoctorsQueryDto,
  ): Promise<PaginatedResponse<Doctor>> {
    const { page, limit, sort, search } = query;

    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['id', 'ASC'];

    const where = search
      ? [{ name: Like(`%${search}%`), isActive: true }]
      : { isActive: true };

    const [doctors, totalItems] = await this.doctorRepository.findAndCount({
      where,
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
    const doctor = await this.findEntityByIdOrFail(id);

    return {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      crm: doctor.crm,
    };
  }

  async findSpecialties( query: FindDoctorsQueryDto, id: number): Promise<PaginatedResponse<Specialty>> {
    const { page, limit, sort, search } = query;

    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['id', 'ASC'];

    const doctor = await this.findEntityByIdOrFail(id);

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

    const doctor = await this.findEntityByIdOrFail(idDoctor);

    const doctorSpecialtyExists = await this.doctorSpecialtyRepository.findOne({
      where: { specialtyId: specialty.id, doctorId: doctor.id } });

    if (doctorSpecialtyExists) {
      throw ConflictException.businessRule(
        `O médico ${doctor.name} já possui a especialidade ${specialty.name} associada.  `);
    }

    const doctorSpecialty =  this.doctorSpecialtyRepository.create({
      specialtyId: specialty.id,
      doctorId: doctor.id
    });

    return await this.doctorSpecialtyRepository.save(doctorSpecialty);
  }

  async dessociateSpecialty(id: number, specialtyId: number) {
    const doctor = await this.findEntityByIdOrFail(id);

    const doctorSpecialty = await this.doctorSpecialtyRepository.findOne({ where: { specialtyId, doctorId: doctor.id } });

    if (!doctorSpecialty) {
      throw new NotFoundException('Associação entre médico e especialidade', `Médico ID: ${id}, Especialidade ID: ${specialtyId}`);
    }

    const specialty = await this.specialtyRepository.findOne({ where: { id: specialtyId }})
    if (!specialty) {
      throw new NotFoundException('Especialidade', specialtyId);
    }

    // Remover apenas a associação da tabela de junção
    // O cascade: true na relação do Doctor cuida do resto
    await this.doctorSpecialtyRepository.remove(doctorSpecialty);

    return;
  }

  async findSchedules(
    id: number,
    query: FindRelatedSchedulesQueryDto,
    currentUser: UserPayload,
  ) {
    const doctor = await this.findEntityByIdOrFail(id);

    if (
      currentUser.type === UserType.DOCTOR &&
      doctor.id !== currentUser.sub
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar agendamentos de outro médico.',
      );
    }

    return this.schedulesService.findByDoctor(doctor.id, query);
  }

  async findAppointments(
    id: number,
    query: FindAppointmentsQueryDto,
    currentUser: UserPayload,
  ) {
    const doctor = await this.findEntityByIdOrFail(id);

    if (
      currentUser.type === UserType.DOCTOR &&
      doctor.id !== currentUser.sub
    ) {
      throw new ForbiddenException(
        'Médico só pode acessar seus próprios atendimentos.',
      );
    }

    return this.appointmentsService.findByDoctor(doctor.id, query);
  }
}
