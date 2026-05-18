import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ConflictException, NotFoundException } from '../../../common/exceptions';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { UsersFactoryService } from './users-factory.service';
import { UsersUniquenessService } from './users-uniqueness.service';
import { FindUsersQueryDto } from '../dto/find-users-query.dto';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { Schedule } from '../../schedules/entities/schedule.entity';
import { ScheduleStatus } from '../../schedules/enum/schedule-status.enum';
import { UserType } from '../enum/user-type.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly usersFactoryService: UsersFactoryService,
    private readonly usersUniquenessService: UsersUniquenessService,
  ) {}

  private readonly activeScheduleStatuses = [
    ScheduleStatus.PENDING,
    ScheduleStatus.CONFIRMED,
  ];

  // Centraliza as regras de inativação para facilitar inclusão de novas restrições
  // (ex.: atendimentos/prontuários) nas próximas etapas.
  private async assertCanDeactivateUser(user: User): Promise<void> {
    switch (user.type) {
      case UserType.DOCTOR:
        await this.assertDoctorHasNoActiveSchedules(user.id);
        return;
      case UserType.PATIENT:
        await this.assertPatientHasNoActiveSchedules(user.id);
        return;
      default:
        return;
    }
  }

  private async assertDoctorHasNoActiveSchedules(userId: number): Promise<void> {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    if (!doctor) {
      return;
    }

    const hasActiveSchedules = await this.scheduleRepository.exists({
      where: {
        doctorId: doctor.id,
        status: In(this.activeScheduleStatuses),
      },
    });

    if (hasActiveSchedules) {
      throw ConflictException.businessRule(
        'Usuário não pode ser inativado',
        `O médico com id ${userId} possui agendamentos ativos (PENDING ou CONFIRMED).`,
      );
    }
  }

  private async assertPatientHasNoActiveSchedules(userId: number): Promise<void> {
    const patient = await this.patientRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    if (!patient) {
      return;
    }

    const hasActiveSchedules = await this.scheduleRepository.exists({
      where: {
        patientId: patient.id,
        status: In(this.activeScheduleStatuses),
      },
    });

    if (hasActiveSchedules) {
      throw ConflictException.businessRule(
        'Usuário não pode ser inativado',
        `O paciente com id ${userId} possui agendamentos ativos (PENDING ou CONFIRMED).`,
      );
    }
  }

  async create(dto: CreateUserDto): Promise<User> {
    await this.usersUniquenessService.validateUniqueFields(dto);
    return await this.usersFactoryService.create(dto);
  }

  async findAll(query: FindUsersQueryDto): Promise<PaginatedResponseDto<User>> {
    const { page, limit, sort, search } = query;
    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['id', 'ASC'];
    const where: FindOptionsWhere<User>[] = [];

    if (search) {
      where.push(
        {
          name: Like(`%${search}%`),
          isActive: true,
          ...(query.type && { type: query.type }),
        },
        {
          email: Like(`%${search}%`),
          isActive: true,
          ...(query.type && { type: query.type }),
        },
      );
    }

    const defaultWhere: FindOptionsWhere<User> | undefined = query.type
      ? { type: query.type, isActive: true }
      : { isActive: true };

    const [items, totalItems] = await this.userRepository.findAndCount({
      where: search ? where : defaultWhere,
      order: { [field]: direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC' },
      skip,
      take: limit,
    });

    return {
      data: items,
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });
    if (!user) throw new NotFoundException('Usuário', id);
    return user;
  }

  async findByEmail(email: string, includePassword: boolean = false): Promise<User> {
    // Esse método será usado principalmente para autenticação, onde precisamos do hash da senha, por isso a opção includePassword.
    
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new NotFoundException('Usuário', email); // marcação de duvida: essa exceptiuon ta certa?
    }

    if (includePassword) {
      return user;
    } else {
      const { password, ...result } = user;
      return result as User;
    }
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    await this.usersUniquenessService.validateUniqueFields(
      { type: user.type, email: dto.email, crm: dto.crm },
      id,
    );

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.assertCanDeactivateUser(user);
    user.deactivate();
    await this.userRepository.save(user);
  }
}
