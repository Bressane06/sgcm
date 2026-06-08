import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Consultation } from './entities/consultation.entity';
import { Exam } from './entities/exam.entity';
import { FollowUp } from './entities/follow-up.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { AppointmentStatus } from './enum/appointment-status.enum';
import { AppointmentType } from './enum/appointment-type.enum';
import { Schedule } from '../schedules/entities/schedule.entity';
import { ScheduleStatus } from '../schedules/enum/schedule-status.enum';
import { UserType } from '../users/enum/user-type.enum';
import { ConflictException, NotFoundException } from '../../common/exceptions';
import type { UserPayload } from '../auth/models/user-payload.model';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly dataSource: DataSource,
  ) {}

  private assertAllowedFieldsForType(
    dto: CreateAppointmentDto | UpdateAppointmentDto,
    type: AppointmentType,
  ): void {
    const receivedWrongFieldsByType: Record<AppointmentType, string[]> = {
      [AppointmentType.CONSULTATION]: [
        ...(dto.examName ? ['examName'] : []),
        ...(dto.result ? ['result'] : []),
        ...(dto.observations ? ['observations'] : []),
        ...(dto.notes ? ['notes'] : []),
        ...(dto.nextSteps ? ['nextSteps'] : []),
      ],
      [AppointmentType.EXAM]: [
        ...(dto.reason ? ['reason'] : []),
        ...(dto.diagnosticHypothesis ? ['diagnosticHypothesis'] : []),
        ...(dto.prescription ? ['prescription'] : []),
        ...(dto.notes ? ['notes'] : []),
        ...(dto.nextSteps ? ['nextSteps'] : []),
      ],
      [AppointmentType.FOLLOW_UP]: [
        ...(dto.reason ? ['reason'] : []),
        ...(dto.diagnosticHypothesis ? ['diagnosticHypothesis'] : []),
        ...(dto.prescription ? ['prescription'] : []),
        ...(dto.examName ? ['examName'] : []),
        ...(dto.result ? ['result'] : []),
        ...(dto.observations ? ['observations'] : []),
      ],
    };

    const wrongFields = receivedWrongFieldsByType[type] ?? [];

    if (wrongFields.length > 0) {
      throw new BadRequestException(
        `Campos inválidos para atendimento ${type}: ${wrongFields.join(', ')}.`,
      );
    }
  }

  private async findScheduleOrFail(scheduleId: number): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: {
        doctor: true,
        patient: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException('Agendamento', scheduleId);
    }

    return schedule;
  }

  private createAppointmentEntity(
    manager: EntityManager,
    dto: CreateAppointmentDto,
    schedule: Schedule,
  ): Appointment {
    const base = {
      schedule,
      type: dto.type,
      status: AppointmentStatus.IN_PROGRESS,
    };

    switch (dto.type) {
      case AppointmentType.CONSULTATION:
        return manager.getRepository(Consultation).create({
          ...base,
          reason: dto.reason,
          diagnosticHypothesis: dto.diagnosticHypothesis,
          prescription: dto.prescription,
        });

      case AppointmentType.EXAM:
        return manager.getRepository(Exam).create({
          ...base,
          examName: dto.examName,
          result: dto.result,
          observations: dto.observations,
        });

      case AppointmentType.FOLLOW_UP:
        return manager.getRepository(FollowUp).create({
          ...base,
          notes: dto.notes,
          nextSteps: dto.nextSteps,
        });

      default:
        throw new BadRequestException('Tipo de atendimento inválido.');
    }
  }

  private toResponse(appointment: Appointment): AppointmentResponseDto {
    return {
      id: appointment.id,
      status: appointment.status,
      type: appointment.type,
      scheduleId: appointment.scheduleId,
      scheduledAt: appointment.schedule.scheduledAt,
      doctorId: appointment.schedule.doctorId,
      patientId: appointment.schedule.patientId,
      reason:
        appointment.type === AppointmentType.CONSULTATION
          ? (appointment as Consultation).reason
          : undefined,
      diagnosticHypothesis:
        appointment.type === AppointmentType.CONSULTATION
          ? (appointment as Consultation).diagnosticHypothesis
          : undefined,
      prescription:
        appointment.type === AppointmentType.CONSULTATION
          ? (appointment as Consultation).prescription
          : undefined,
      examName:
        appointment.type === AppointmentType.EXAM
          ? (appointment as Exam).examName
          : undefined,
      result:
        appointment.type === AppointmentType.EXAM
          ? (appointment as Exam).result
          : undefined,
      observations:
        appointment.type === AppointmentType.EXAM
          ? (appointment as Exam).observations
          : undefined,
      notes:
        appointment.type === AppointmentType.FOLLOW_UP
          ? (appointment as FollowUp).notes
          : undefined,
      nextSteps:
        appointment.type === AppointmentType.FOLLOW_UP
          ? (appointment as FollowUp).nextSteps
          : undefined,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }

  private async findAppointmentOrFail(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: {
        schedule: {
          doctor: true,
          patient: true,
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Atendimento', id);
    }

    return appointment;
  }

  private assertDoctorOwnsAppointment(
    appointment: Appointment,
    currentUser: UserPayload,
  ): void {
    if (currentUser.type === UserType.ADMIN) {
      return;
    }

    if (
      currentUser.type === UserType.DOCTOR &&
      appointment.schedule.doctor.id === currentUser.sub
    ) {
      return;
    }

    throw new ForbiddenException(
      'Médico só pode modificar seus próprios atendimentos.',
    );
  }

  async create(
    dto: CreateAppointmentDto,
    currentUser: UserPayload,
  ): Promise<AppointmentResponseDto> {
    this.assertAllowedFieldsForType(dto, dto.type);

    const schedule = await this.findScheduleOrFail(dto.scheduleId);

    if (
      currentUser.type === UserType.DOCTOR &&
      schedule.doctor.id !== currentUser.sub
    ) {
      throw new ForbiddenException(
        'Médico só pode criar atendimentos para seus próprios agendamentos.',
      );
    }

    if (schedule.status !== ScheduleStatus.CONFIRMED) {
      throw new BadRequestException(
        'Somente agendamentos CONFIRMED podem gerar atendimentos.',
      );
    }

    const existingCount = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.scheduleId = :scheduleId', {
        scheduleId: dto.scheduleId,
      })
      .getCount();

    if (existingCount > 0) {
      throw ConflictException.businessRule(
        'Atendimento já existente',
        `O agendamento com id ${dto.scheduleId} já possui um atendimento associado.`,
      );
    }

    const appointment = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        const entity = this.createAppointmentEntity(manager, dto, schedule);
        const saved = await manager.save(entity);

        schedule.status = ScheduleStatus.COMPLETED;
        await manager.save(schedule);

        return saved;
      },
    );

    return this.toResponse(appointment);
  }

  async findAll(
    query: FindAppointmentsQueryDto,
  ): Promise<{ data: AppointmentResponseDto[]; meta: any }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sort = query.sort ?? 'createdAt:DESC';
    const { scheduleId, status, type } = query;

    const [field, direction] = sort.split(':');

    const normalizedDirection =
      direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const allowedSortFields = ['createdAt', 'updatedAt', 'id', 'status', 'type'];
    const sortField = allowedSortFields.includes(field) ? field : 'createdAt';

    const qb = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.schedule', 'schedule')
      .leftJoinAndSelect('schedule.doctor', 'doctor')
      .leftJoinAndSelect('schedule.patient', 'patient')

    if (scheduleId) {
      qb.andWhere('appointment.scheduleId = :scheduleId', { scheduleId });
    }

    if (status) {
      qb.andWhere('appointment.status = :status', { status });
    }

    if (type) {
      qb.andWhere('appointment.type = :type', { type });
    }

    if (query.doctorId) {
      qb.andWhere('schedule.doctorId = :doctorId', {
        doctorId: query.doctorId,
      });
    }

    if (query.patientId) {
      qb.andWhere('schedule.patientId = :patientId', {
        patientId: query.patientId,
      });
    }

    const appointments = await qb
      .orderBy(`appointment.${sortField}`, normalizedDirection)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const totalItems = appointments.length;

    return {
      data: appointments.map((appointment) => this.toResponse(appointment)),
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOneWithAccess(
    id: number,
    currentUser: UserPayload,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.findAppointmentOrFail(id);

    if (currentUser.type === UserType.DOCTOR) {
      if (appointment.schedule.doctor.id !== currentUser.sub) {
        throw new ForbiddenException(
          'Médico só pode acessar seus próprios atendimentos.',
        );
      }
    }

    if (currentUser.type === UserType.PATIENT) {
      if (appointment.schedule.patient.id !== currentUser.sub) {
        throw new ForbiddenException(
          'Paciente só pode acessar seus próprios atendimentos.',
        );
      }
    }

    return this.toResponse(appointment);
  }

  async update(
    id: number,
    dto: UpdateAppointmentDto,
    currentUser: UserPayload,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.findAppointmentOrFail(id);

    this.assertDoctorOwnsAppointment(appointment, currentUser);

    if (dto.type && dto.type !== appointment.type) {
      throw new BadRequestException(
        'O tipo de atendimento não pode ser alterado após a criação.',
      );
    }

    if (appointment.status === AppointmentStatus.FINISHED) {
      throw new ConflictException(
        'Não é possível atualizar um atendimento finalizado.',
      );
    }

    const currentType = appointment.type;
    this.assertAllowedFieldsForType(dto, currentType);

    if (currentType === AppointmentType.CONSULTATION) {
      const consultation = appointment as Consultation;
      consultation.reason =
        dto.reason ?? consultation.reason;
      consultation.diagnosticHypothesis = dto.diagnosticHypothesis ?? consultation.diagnosticHypothesis;
      consultation.prescription = dto.prescription ?? consultation.prescription;
    }

    if (currentType === AppointmentType.EXAM) {
      const exam = appointment as Exam;
      exam.examName = dto.examName ?? exam.examName;
      exam.result = dto.result ?? exam.result;
      exam.observations = dto.observations ?? exam.observations;
    }

    if (currentType === AppointmentType.FOLLOW_UP) {
      const followUp = appointment as FollowUp;
      followUp.notes = dto.notes ?? followUp.notes;
      followUp.nextSteps = dto.nextSteps ?? followUp.nextSteps;
    }

    const saved = await this.appointmentRepository.save(appointment);
    return this.toResponse(saved);
  }

  async finish(
    id: number,
    currentUser: UserPayload,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.findAppointmentOrFail(id);

    this.assertDoctorOwnsAppointment(appointment, currentUser);

    if (appointment.status === AppointmentStatus.FINISHED) {
      throw ConflictException.businessRule(
        'O Atendimento já foi finalizado anteriormente',
      );
    }

    appointment.status = AppointmentStatus.FINISHED;
    const saved = await this.appointmentRepository.save(appointment);
    return this.toResponse(saved);
  }

  async findByDoctor(
    doctorId: number,
    query: FindAppointmentsQueryDto,
  ): Promise<{ data: AppointmentResponseDto[]; meta: any }> {
    return this.findAll({
      ...query,
      doctorId,
    });
  }

  async findByPatient(
    patientId: number,
    query: FindAppointmentsQueryDto,
  ): Promise<{ data: AppointmentResponseDto[]; meta: any }> {
    return this.findAll({
      ...query,
      patientId,
    });
  }
}
