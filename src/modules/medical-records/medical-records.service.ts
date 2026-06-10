import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { MedicalRecord } from './entities/medical-record.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '../../common';
import { UserPayload } from '../auth/models/user-payload.model';
import { Appointment } from '../appointments/entities/appointment.entity';
import { UserType } from '../users/enum/user-type.enum';
import { AppointmentStatus } from '../appointments/enum/appointment-status.enum';
import { AppointmentType } from '../appointments/enum/appointment-type.enum';
import { MedicalRecordResponseDto } from './dto/medical-record-response.dto';
import { Exam } from '../appointments/entities/exam.entity';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  private async findAppointmentOrFail(
    appointmentId: number,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: {
        schedule: {
          doctor: true,
          patient: true,
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Atendimento', appointmentId);
    }

    return appointment;
  }

  private toResponse(record: MedicalRecord): MedicalRecordResponseDto {
    const response: MedicalRecordResponseDto = {
      id: record.id,
      patientId: record.patient.id,
      updatedBy: record.updatedBy,
      appointmentId: record.appointmentId,
      diagnosis: record.diagnosis,
      notes: record.notes,
      prescriptions: record.prescriptions,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return response;
  }

  async create(
    id: number,
    createMedicalRecordDto: CreateMedicalRecordDto,
    user: UserPayload,
  ): Promise<MedicalRecordResponseDto> {
    const appointment = await this.findAppointmentOrFail(id);

    if (
      appointment.schedule.doctor.id !== user.sub &&
      user.type === UserType.DOCTOR
    ) {
      throw new ForbiddenException(
        'Médico só pode criar prontuários para seus próprios atendimentos.',
      );
    }

    if (appointment.status !== AppointmentStatus.FINISHED) {
      throw new BadRequestException(
        'Somente atendimentos FINISHED podem gerar prontuários.',
      );
    }

    const medicalRecord = await this.medicalRecordRepository.findOne({
      where: { appointmentId: id },
    });

    if (medicalRecord) {
      throw ConflictException.businessRule(
        'prontuário já existente no atendimento informado',
        `O atendimento com id ${id} já possui um prontuário associado.`,
      );
    }

    const record = this.medicalRecordRepository.create({
      ...createMedicalRecordDto,
      createdBy: user.sub,
      updatedBy: user.sub,
      appointmentId: id,
      patient: appointment.schedule.patient,
      appointment: appointment as Exam,
    });

    await this.medicalRecordRepository.save(record);

    const saved = await this.medicalRecordRepository.findOne({
      where: { id: record.id },
      relations: { patient: true },
    });

    return this.toResponse(saved!);
  }

  async findAppointmentRecords(
    id: number,
    user: UserPayload,
  ): Promise<MedicalRecordResponseDto> {
    const record = await this.medicalRecordRepository.findOne({
      where: { appointmentId: id },
      relations: { patient: true },
    });

    if (!record) throw new NotFoundException('Prontuário', id);

    // Controle por recurso
    if (user.type === UserType.PATIENT && record.patient.id !== user.sub) {
      throw new ForbiddenException(
        'Paciente só pode acessar seus próprios prontuários.',
      );
    }
    if (user.type === UserType.DOCTOR && record.createdBy !== user.sub) {
      throw new ForbiddenException(
        'Médico só pode acessar prontuários de seus próprios atendimentos.',
      );
    }

    return this.toResponse(record);
  }

  async update(
    id: number,
    updateMedicalRecordDto: UpdateMedicalRecordDto,
    user: UserPayload,
  ): Promise<MedicalRecordResponseDto> {
    const record = await this.medicalRecordRepository.findOneBy({ id });

    if (!record) {
      throw new NotFoundException('Prontuário não encontrado.');
    }

    if (record.createdBy !== user.sub && user.type === UserType.DOCTOR) {
      throw new ForbiddenException(
        'Médico só pode alterar seus próprios prontuários.',
      );
    }

    Object.assign(record, {
      ...updateMedicalRecordDto,
      updatedBy: user.sub,
    });

    await this.medicalRecordRepository.save(record);

    const saved = await this.medicalRecordRepository.findOne({
      where: { id },
      relations: { patient: true },
    });

    return this.toResponse(saved!);
  }

  delete() {
    throw ConflictException.businessRule(
      'Um prontuário não pode ser excluído.',
      'representa um documento clínico permanente.',
    );
  }

  async findPatientRecords(
    id: number,
    user: UserPayload,
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<MedicalRecordResponseDto>> {
    if (user.type === UserType.PATIENT && user.sub !== id) {
      throw new ForbiddenException(
        'Paciente só pode acessar seus próprios prontuários.',
      );
    }

    const { page, limit } = pagination;

    const [records, total] = await this.medicalRecordRepository.findAndCount({
      where: { patient: { id } },
      relations: { patient: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    if (!records.length) {
      throw new NotFoundException('Prontuários', id);
    }

    return {
      data: records.map((r) => this.toResponse(r)),
      meta: {
        totalItems: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findDoctorRecords(
    id: number,
    user: UserPayload,
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<MedicalRecordResponseDto>> {
    if (user.type === UserType.DOCTOR && user.sub !== id) {
      throw new ForbiddenException(
        'Médico só pode acessar prontuários de seus próprios atendimentos.',
      );
    }

    const { page, limit } = pagination;

    const [records, total] = await this.medicalRecordRepository.findAndCount({
      where: {
        appointment: {
          schedule: {
            doctor: { id },
          },
        },
      },
      relations: {
        patient: true,
        appointment: { schedule: { doctor: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    if (!records.length) {
      throw new NotFoundException('Prontuários', id);
    }

    return {
      data: records.map((r) => this.toResponse(r)),
      meta: {
        totalItems: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
