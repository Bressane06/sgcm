import {
  BadRequestException,
  Injectable,
  ConflictException as NestConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Doctor } from '../../users/entities/doctor.entity';
import { Patient } from '../../users/entities/patient.entity';
import { NotFoundException, ConflictException } from '../../../common/exceptions';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { FindSchedulesQueryDto } from '../dto/find-schedules-query.dto';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';
import { UpdateScheduleStatusDto } from '../dto/update-schedule-status.dto';
import { HomeSchedule } from '../entities/home-schedule.entity';
import { InPersonSchedule } from '../entities/in-person-schedule.entity';
import { OnlineSchedule } from '../entities/online-schedule.entity';
import { Schedule } from '../entities/schedule.entity';
import { ScheduleStatus } from '../enum/schedule-status.enum';
import { ScheduleType } from '../enum/schedule-type.enum';
import { PaginatedResponseDto } from '../../../common/dto/paginated-response.dto';
import { ScheduleResponseDto } from '../dto/schedule-response.dto';


@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(InPersonSchedule)
    private readonly inPersonScheduleRepository: Repository<InPersonSchedule>,
    @InjectRepository(OnlineSchedule)
    private readonly onlineScheduleRepository: Repository<OnlineSchedule>,
    @InjectRepository(HomeSchedule)
    private readonly homeScheduleRepository: Repository<HomeSchedule>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  private assertAllowedFieldsForType(dto: CreateScheduleDto): void {
    const receivedWrongFieldsByType: Record<ScheduleType, string[]> = {
      [ScheduleType.IN_PERSON]: [
        ...(dto.accessLink ? ['accessLink'] : []),
        ...(dto.platform ? ['platform'] : []),
        ...(dto.fullAddress ? ['fullAddress'] : []),
        ...(dto.accessNotes ? ['accessNotes'] : []),
      ],
      [ScheduleType.ONLINE]: [
        ...(dto.room ? ['room'] : []),
        ...(dto.unit ? ['unit'] : []),
        ...(dto.fullAddress ? ['fullAddress'] : []),
        ...(dto.accessNotes ? ['accessNotes'] : []),
      ],
      [ScheduleType.HOME]: [
        ...(dto.room ? ['room'] : []),
        ...(dto.unit ? ['unit'] : []),
        ...(dto.accessLink ? ['accessLink'] : []),
        ...(dto.platform ? ['platform'] : []),
      ],
    };

    const wrongFields = receivedWrongFieldsByType[dto.type];

    if (wrongFields.length > 0) {
      throw new BadRequestException(
        `Campos inválidos para agendamento ${dto.type}: ${wrongFields.join(', ')}.`,
      );
    }
  }

  async create(dto: CreateScheduleDto): Promise<ScheduleResponseDto> {
    this.assertAllowedFieldsForType(dto);
    this.assertFutureDate(dto.scheduledAt);

    const doctor = await this.findDoctorOrFail(dto.doctorId);
    const patient = await this.findPatientOrFail(dto.patientId);

    await this.assertNoConfirmedConflict(dto.doctorId, new Date(dto.scheduledAt));

    const baseData = {
      scheduledAt: new Date(dto.scheduledAt),
      status: ScheduleStatus.PENDING,
      type: dto.type,
      doctor,
      doctorId: dto.doctorId,
      patient,
      patientId: dto.patientId,
    };

    switch (dto.type) {
      case ScheduleType.IN_PERSON: {
        const schedule = await this.inPersonScheduleRepository.save(
          this.inPersonScheduleRepository.create({
            ...baseData,
            room: dto.room,
            unit: dto.unit,
          }),
        );

        return this.toResponse(schedule);
      }

      case ScheduleType.ONLINE: {
        const schedule = await this.onlineScheduleRepository.save(
          this.onlineScheduleRepository.create({
            ...baseData,
            accessLink: dto.accessLink,
            platform: dto.platform,
          }),
        );

        return this.toResponse(schedule);
      }

      case ScheduleType.HOME: {
        const schedule = await this.homeScheduleRepository.save(
          this.homeScheduleRepository.create({
            ...baseData,
            fullAddress: dto.fullAddress,
            accessNotes: dto.accessNotes,
          }),
        );

        return this.toResponse(schedule);
      }

      default:
        throw new BadRequestException('Tipo de agendamento inválido.');
    }
  }

  async findAll(
    query: FindSchedulesQueryDto,
  ): Promise<PaginatedResponseDto<ScheduleResponseDto>> {
    const { page, limit, sort, doctorId, patientId, status, type, startDate, endDate } = query;

    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['scheduledAt', 'ASC'];

    const where: FindOptionsWhere<Schedule> = {};

    if (doctorId) where.doctorId = doctorId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;
    if (type) where.type = type;

    if (startDate && endDate) {
      where.scheduledAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.scheduledAt = MoreThanOrEqual(new Date(startDate));
    } else if (endDate) {
      where.scheduledAt = LessThanOrEqual(new Date(endDate));
    }

    const [data, totalItems] = await this.scheduleRepository.findAndCount({
      where,
      order: { [field]: direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC' },
      skip,
      take: limit,
    });

    return {
      data: data.map((schedule) => this.toResponse(schedule)),
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  private async findEntityOrFail(id: number): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({ where: { id } });

    if (!schedule) {
      throw new NotFoundException('Agendamento', id);
    }

    return schedule;
  }

  async findOne(id: number): Promise<ScheduleResponseDto> {
    const schedule = await this.findEntityOrFail(id);
    return this.toResponse(schedule);
  }

  async update(id: number, dto: UpdateScheduleDto): Promise<ScheduleResponseDto> {
    const schedule = await this.findEntityOrFail(id);

    if (dto.scheduledAt) {
      this.assertFutureDate(dto.scheduledAt);
    }

    const doctorId = dto.doctorId ?? schedule.doctorId;
    const patientId = dto.patientId ?? schedule.patientId;
    const scheduledAt = dto.scheduledAt
      ? new Date(dto.scheduledAt)
      : schedule.scheduledAt;

    const doctor = dto.doctorId
      ? await this.findDoctorOrFail(dto.doctorId)
      : schedule.doctor;

    const patient = dto.patientId
      ? await this.findPatientOrFail(dto.patientId)
      : schedule.patient;

    if (schedule.status === ScheduleStatus.CONFIRMED) {
      await this.assertNoConfirmedConflict(doctorId, scheduledAt, id);
    }

    Object.assign(schedule, {
      ...dto,
      scheduledAt,
      doctor,
      doctorId,
      patient,
      patientId,
    });

    const saved = await this.scheduleRepository.save(schedule);
    return this.toResponse(saved);
  }

  async updateStatus(
    id: number,
    dto: UpdateScheduleStatusDto,
  ): Promise<ScheduleResponseDto> {
    const schedule = await this.findEntityOrFail(id);

    if (
      dto.status !== ScheduleStatus.CANCELLED &&
      (dto.cancellationReason || dto.cancelledBy)
    ) {
      throw new BadRequestException(
        'cancellationReason e cancelledBy só podem ser enviados quando o status for CANCELLED.',
      );
    }

    if (dto.status === ScheduleStatus.COMPLETED) {
      throw new BadRequestException(
        'O status COMPLETED não pode ser enviado diretamente pela API. Essa transição será interna na etapa de atendimentos.',
      );
    }

    this.assertAllowedStatusTransition(schedule.status, dto.status);

    if (dto.status === ScheduleStatus.CONFIRMED) {
      await this.assertNoConfirmedConflict(
        schedule.doctorId,
        schedule.scheduledAt,
        schedule.id,
      );
    }

    schedule.status = dto.status;

    if (dto.status === ScheduleStatus.CANCELLED) {
      schedule.cancelledAt = new Date();
      schedule.cancellationReason = dto.cancellationReason;
      schedule.cancelledBy = dto.cancelledBy ?? 'SYSTEM';
    }

    const saved = await this.scheduleRepository.save(schedule);
    return this.toResponse(saved);
  }

  async remove(id: number): Promise<void> {
    const schedule = await this.findEntityOrFail(id);

    if (schedule.status === ScheduleStatus.COMPLETED) {
      throw ConflictException.businessRule(
        'Agendamento concluído não pode ser removido',
        `O agendamento com id ${id} já originou um atendimento clínico.`,
      );
    }

    await this.scheduleRepository.remove(schedule);
  }

  async findByDoctor(
    doctorId: number,
    query: FindSchedulesQueryDto,
  ): Promise<PaginatedResponseDto<ScheduleResponseDto>> {
    await this.findDoctorOrFail(doctorId);
    return this.findAll({ ...query, doctorId });
  }

  async findByPatient(
    patientId: number,
    query: FindSchedulesQueryDto,
  ): Promise<PaginatedResponseDto<ScheduleResponseDto>> {
    await this.findPatientOrFail(patientId);
    return this.findAll({ ...query, patientId });
  }

  async complete(id: number): Promise<ScheduleResponseDto> {
    const schedule = await this.findEntityOrFail(id);

    if (schedule.status !== ScheduleStatus.CONFIRMED) {
      throw new BadRequestException(
        `Apenas agendamentos CONFIRMED podem ser concluídos. Status atual: ${schedule.status}.`,
      );
    }

    schedule.status = ScheduleStatus.COMPLETED;
    const saved = await this.scheduleRepository.save(schedule);
    return this.toResponse(saved);
  }

  private assertFutureDate(value: string): void {
    const date = new Date(value);

    if (date.getTime() <= Date.now()) {
      throw new BadRequestException(
        'scheduledAt deve ser uma data e hora no futuro.',
      );
    }
  }

  private async findDoctorOrFail(id: number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { id, user: { isActive: true } },
      relations: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException('Médico', id);
    }

    return doctor;
  }

  private async findPatientOrFail(id: number): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id, user: { isActive: true } },
      relations: { user: true },
    });

    if (!patient) {
      throw new NotFoundException('Paciente', id);
    }

    return patient;
  }

  private async assertNoConfirmedConflict(
    doctorId: number,
    scheduledAt: Date,
    ignoredScheduleId?: number,
  ): Promise<void> {
    const existing = await this.scheduleRepository.findOne({
      where: {
        doctorId,
        scheduledAt,
        status: ScheduleStatus.CONFIRMED,
      },
    });

    if (existing && existing.id !== ignoredScheduleId) {
      throw ConflictException.businessRule(
        'Conflito de agenda',
        `O médico com id ${doctorId} já possui um agendamento confirmado neste horário.`,
      );
    }
  }

  private assertAllowedStatusTransition(
    currentStatus: ScheduleStatus,
    nextStatus: ScheduleStatus,
  ): void {
    const allowedTransitions: Record<ScheduleStatus, ScheduleStatus[]> = {
      [ScheduleStatus.PENDING]: [
        ScheduleStatus.CONFIRMED,
        ScheduleStatus.CANCELLED,
      ],
      [ScheduleStatus.CONFIRMED]: [ScheduleStatus.CANCELLED],
      [ScheduleStatus.CANCELLED]: [],
      [ScheduleStatus.COMPLETED]: [],
    };

    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
      throw new BadRequestException(
        `Transição de status inválida: ${currentStatus} → ${nextStatus}.`,
      );
    }
  }

  private toResponse(schedule: Schedule): ScheduleResponseDto {
    const response: ScheduleResponseDto = {
      id: schedule.id,
      scheduledAt: schedule.scheduledAt,
      status: schedule.status,
      type: schedule.type,
      doctorId: schedule.doctorId,
      patientId: schedule.patientId,
      cancelledAt: schedule.cancelledAt,
      cancellationReason: schedule.cancellationReason,
      cancelledBy: schedule.cancelledBy,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };

    if (schedule instanceof InPersonSchedule) {
      response.room = schedule.room;
      response.unit = schedule.unit;
    }

    if (schedule instanceof OnlineSchedule) {
      response.accessLink = schedule.accessLink;
      response.platform = schedule.platform;
    }

    if (schedule instanceof HomeSchedule) {
      response.fullAddress = schedule.fullAddress;
      response.accessNotes = schedule.accessNotes;
    }

    return response;
  }
}