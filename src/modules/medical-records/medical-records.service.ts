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

    if (
      appointment.status !== AppointmentStatus.FINISHED ||
      appointment.type !== AppointmentType.EXAM
    ) {
      throw new BadRequestException(
        'Somente atendimentos FINISHED do tipo EXAM podem gerar prontuários.',
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
      updatedBy: user.sub,
      createdBy: user.sub,
      patient: { ...appointment.schedule.patient },
      appointment: appointment as Exam,
    });

    await this.medicalRecordRepository.save(record);

    const saved = await this.medicalRecordRepository.findOne({
      where: { id: record.id },
      relations: { patient: true },
    });

    return this.toResponse(saved!);
  }

  findAppointmentRecords(id: number) {
    return `This action returns all medicalRecords`;
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

    if (record.id !== user.sub && user.type === UserType.DOCTOR) {
      throw new ForbiddenException(
        'Médico só pode alterar seus próprios prontuários.',
      );
    }

    Object.assign(record, updateMedicalRecordDto);

    const saved = await this.medicalRecordRepository.save(record);

    return this.toResponse(saved);
  }

  delete() {
    throw ConflictException.businessRule(
      'Um prontuário não pode ser excluído.',
      'representa um documento clínico permanente.',
    );
  }

  async findPatientRecords(id: number): Promise<MedicalRecord[]> {
    const records = await this.medicalRecordRepository.find({
      where: { patient: { id } },
    });
    return records;
  }

  async findDoctorRecords(id: number): Promise<MedicalRecord[]> {
    const records = await this.medicalRecordRepository.find({
      where: {
        updatedBy: id,
      },
    });
    return records;
  }
}
