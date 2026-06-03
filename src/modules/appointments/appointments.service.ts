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
        ...(dto.consultationReason ? ['consultationReason'] : []),
        ...(dto.diagnosis ? ['diagnosis'] : []),
        ...(dto.prescription ? ['prescription'] : []),
        ...(dto.notes ? ['notes'] : []),
        ...(dto.nextSteps ? ['nextSteps'] : []),
      ],
      [AppointmentType.FOLLOW_UP]: [
        ...(dto.consultationReason ? ['consultationReason'] : []),
        ...(dto.diagnosis ? ['diagnosis'] : []),
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
      status: AppointmentStatus.OPEN,
    };

    switch (dto.type) {
      case AppointmentType.CONSULTATION:
        return manager.getRepository(Consultation).create({
          ...base,
          consultationReason: dto.consultationReason,
          diagnosis: dto.diagnosis,
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
      consultationReason:
        appointment.type === AppointmentType.CONSULTATION
          ? (appointment as Consultation).consultationReason
          : undefined,
      diagnosis:
        appointment.type === AppointmentType.CONSULTATION
          ? (appointment as Consultation).diagnosis
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

  async create(dto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    this.assertAllowedFieldsForType(dto, dto.type);

    const schedule = await this.findScheduleOrFail(dto.scheduleId);

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
}
