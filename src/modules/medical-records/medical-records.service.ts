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
import { Doctor } from '../users/entities/doctor.entity';
import { AppointmentType } from '../appointments/enum/appointment-type.enum';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
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

  async create(
    id: number,
    createMedicalRecordDto: CreateMedicalRecordDto,
    user: UserPayload,
  ) {
    const appointment = await this.findAppointmentOrFail(id);

    if (
      appointment.schedule.doctor.id != user.sub &&
      user.type === UserType.DOCTOR
    ) {
      throw new ForbiddenException(
        'Médico só pode criar laudos para seus próprios atendimentos.',
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
      where: { AppointmentId: id },
    });

    if (medicalRecord) {
      throw ConflictException.businessRule(
        'prontuário já existente no atendimento informado',
        `O atendimento com id ${id} já possui um prontuário associado.`,
      );
    }

    const saved = await this.medicalRecordRepository.save(
      createMedicalRecordDto,
    );

    return saved;
  }

  findAppointmentRecords(id: number) {
    return `This action returns all medicalRecords`;
  }

  async update(
    id: number,
    updateMedicalRecordDto: UpdateMedicalRecordDto,
  ): Promise<MedicalRecord> {
    const record = await this.medicalRecordRepository.findOneBy({ id });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    Object.assign(record, updateMedicalRecordDto);

    await this.medicalRecordRepository.save(record);

    return record;
  }

  findPatientRecords(id: number) {
    const records = this.medicalRecordRepository.find({
      where: {
        patientId: {
          id,
        },
      },
    });
    return records;
  }

  findDoctorRecords(id: number) {
    const records = this.medicalRecordRepository.find({
      where: {
        updatedBy: {
          id,
        },
      },
    });
    return records;
  }
}
