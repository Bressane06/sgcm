import { Injectable, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Buffer } from 'buffer';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '../../common/exceptions';
import { ReportStatus } from './enum/report-status.enum';
import { Report } from './entities/report.entity';
import { Patient } from '../users/entities/patient.entity';
import { Doctor } from '../users/entities/doctor.entity';
import type { UserPayload } from '../auth/models/user-payload.model';
import { UserType } from '../users/enum/user-type.enum';
import { CreateReportDto } from './dto/create-report.dto';
import { RevokeReportDto } from './dto/revoke-report.dto';
import { ReportResponseDto } from './dto/report-response.dto';
import { ReportValidationDto } from './dto/report-validation.dto';
import { ConflictException } from '../../common/exceptions/conflict.exception';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async create(
    appointmentId: number,
    dto: CreateReportDto,
    currentUser: UserPayload,
  ): Promise<ReportResponseDto> {
    await this.findPatientOrFail(dto.patientId);
    const doctor = await this.findDoctorOrFail(dto.doctorId);

    if (currentUser.type === UserType.DOCTOR) {
      const currentDoctor = await this.findDoctorByUserIdOrFail(currentUser.sub);

      if (currentDoctor.id !== doctor.id) {
        throw new ForbiddenException(
          'Você só pode emitir laudos vinculados ao seu próprio cadastro profissional.',
        );
      }
    }

    const activeReport = await this.reportRepository.findOne({
      where: {
        appointmentId,
        status: ReportStatus.ACTIVE,
      },
    });

    if (activeReport) {
      throw ConflictException.businessRule(
        'Laudo ativo já existente para este exame.',
      );
    }

    const report = this.reportRepository.create({
      appointmentId,
      patientId: dto.patientId,
      doctorId: dto.doctorId,
      examType: dto.examType,
      result: dto.result,
      status: ReportStatus.ACTIVE,
      validationCode: randomUUID(),
      issuedByUserId: currentUser.sub,
      issuedByDoctorId:
        currentUser.type === UserType.DOCTOR ? doctor.id : dto.doctorId,
    });

    const saved = await this.reportRepository.save(report);
    return this.toResponseDto(await this.findReportByIdOrFail(saved.id));
  }

  async getPdf(id: number, currentUser: UserPayload): Promise<StreamableFile> {
    const report = await this.findReportByIdOrFail(id);
    await this.assertCanAccessReport(report, currentUser);

    const pdf = this.buildPdfBuffer(report);
    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition: `inline; filename="report-${report.id}.pdf"`,
    });
  }

  async validate(code: string): Promise<ReportValidationDto> {
    const report = await this.reportRepository.findOne({
      where: { validationCode: code },
      relations: { patient: { user: true }, doctor: { user: true } },
    });

    if (!report) {
      throw new NotFoundException('Laudo', code, true);
    }

    return this.toValidationDto(report);
  }

  async revoke(
    id: number,
    dto: RevokeReportDto,
    currentUser: UserPayload,
  ): Promise<ReportResponseDto> {
    const report = await this.findReportByIdOrFail(id);

    if (report.status === ReportStatus.REVOKED) {
      throw ConflictException.businessRule('Laudo já revogado.');
    }

    await this.assertCanRevokeReport(report, currentUser);

    report.status = ReportStatus.REVOKED;
    report.revokedReason = dto.revokedReason;
    report.revokedAt = new Date();
    report.revokedBy = currentUser.sub;

    await this.reportRepository.save(report);

    return this.toResponseDto(await this.findReportByIdOrFail(id));
  }

  async findByPatient(
    id: number,
    currentUser: UserPayload,
  ): Promise<ReportResponseDto[]> {
    const patient = await this.findPatientOrFail(id);
    await this.assertCanAccessPatient(patient, currentUser);

    const reports = await this.reportRepository.find({
      where: { patientId: id },
      order: { issuedAt: 'DESC' },
      relations: { patient: { user: true }, doctor: { user: true } },
    });

    return reports.map((report) => this.toResponseDto(report));
  }

  async findByDoctor(
    id: number,
    currentUser: UserPayload,
  ): Promise<ReportResponseDto[]> {
    const doctor = await this.findDoctorOrFail(id);
    await this.assertCanAccessDoctor(doctor, currentUser);

    const reports = await this.reportRepository.find({
      where: { doctorId: id },
      order: { issuedAt: 'DESC' },
      relations: { patient: { user: true }, doctor: { user: true } },
    });

    return reports.map((report) => this.toResponseDto(report));
  }

  private async findReportByIdOrFail(id: number): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: { patient: { user: true }, doctor: { user: true } },
    });

    if (!report) {
      throw new NotFoundException('Laudo', id);
    }

    return report;
  }

  private async findPatientOrFail(id: number): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!patient) {
      throw new NotFoundException('Paciente', id);
    }

    return patient;
  }

  private async findDoctorOrFail(id: number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException('Médico', id);
    }

    return doctor;
  }

  private async findDoctorByUserIdOrFail(userId: number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
      relations: { user: true },
    });

    if (!doctor) {
      throw new NotFoundException('Médico', userId);
    }

    return doctor;
  }

  private async assertCanAccessReport(
    report: Report,
    currentUser: UserPayload,
  ): Promise<void> {
    if (currentUser.type === UserType.ADMIN) {
      return;
    }

    if (
      currentUser.type === UserType.PATIENT &&
      report.patient.user.id === currentUser.sub
    ) {
      return;
    }

    if (currentUser.type === UserType.DOCTOR) {
      const currentDoctor = await this.findDoctorByUserIdOrFail(currentUser.sub);

      if (report.issuedByDoctorId === currentDoctor.id) {
        return;
      }
    }

    throw new ForbiddenException('Você não tem permissão para acessar este laudo.');
  }

  private async assertCanAccessPatient(
    patient: Patient,
    currentUser: UserPayload,
  ): Promise<void> {
    if (currentUser.type === UserType.ADMIN) {
      return;
    }

    if (currentUser.type === UserType.PATIENT && patient.user.id === currentUser.sub) {
      return;
    }

    throw new ForbiddenException('Você não tem permissão para acessar os laudos deste paciente.');
  }

  private async assertCanAccessDoctor(
    doctor: Doctor,
    currentUser: UserPayload,
  ): Promise<void> {
    if (currentUser.type === UserType.ADMIN) {
      return;
    }

    if (currentUser.type === UserType.DOCTOR && doctor.user.id === currentUser.sub) {
      return;
    }

    throw new ForbiddenException('Você não tem permissão para acessar os laudos deste médico.');
  }

  private async assertCanRevokeReport(
    report: Report,
    currentUser: UserPayload,
  ): Promise<void> {
    if (currentUser.type === UserType.ADMIN) {
      return;
    }

    if (currentUser.type !== UserType.DOCTOR || !report.issuedByDoctorId) {
      throw new ForbiddenException('Você não tem permissão para revogar este laudo.');
    }

    const currentDoctor = await this.findDoctorByUserIdOrFail(currentUser.sub);

    if (currentDoctor.id !== report.issuedByDoctorId) {
      throw new ForbiddenException('Você não tem permissão para revogar este laudo.');
    }
  }

  private toResponseDto(report: Report): ReportResponseDto {
    return {
      id: report.id,
      appointmentId: report.appointmentId,
      validationCode: report.validationCode,
      status: report.status,
      patient: {
        id: report.patient.id,
        name: report.patient.user.name,
        email: report.patient.user.email,
      },
      doctor: {
        id: report.doctor.id,
        name: report.doctor.user.name,
        email: report.doctor.user.email,
        crm: report.doctor.crm,
      },
      examType: report.examType,
      result: report.result,
      issuedAt: report.issuedAt,
      revokedReason: report.revokedReason ?? null,
      revokedAt: report.revokedAt ?? null,
      revokedBy: report.revokedBy ?? null,
    };
  }

  private toValidationDto(report: Report): ReportValidationDto {
    return {
      validationCode: report.validationCode,
      status: report.status,
      revoked: report.status === ReportStatus.REVOKED,
      patientName: report.patient.user.name,
      doctorName: report.doctor.user.name,
      examType: report.examType,
      issuedAt: report.issuedAt,
      revokedAt: report.revokedAt ?? null,
    };
  }

  private buildPdfBuffer(report: Report): Buffer {
    const lines = [
      'LAUDO MEDICO',
      `Paciente: ${report.patient.user.name}`,
      `Medico: ${report.doctor.user.name}`,
      `Tipo de exame: ${report.examType}`,
      `Resultado: ${report.result}`,
      `Data de emissao: ${report.issuedAt.toISOString()}`,
      `Codigo de validacao: ${report.validationCode}`,
      `Status: ${report.status}`,
      report.status === ReportStatus.REVOKED && report.revokedAt
        ? `Revogado em: ${report.revokedAt.toISOString()}`
        : '',
      report.status === ReportStatus.REVOKED && report.revokedReason
        ? `Motivo da revogacao: ${report.revokedReason}`
        : '',
    ].filter(Boolean) as string[];

    const textObjects = lines
      .map((line, index) => {
        const y = 760 - index * 24;
        const size = index === 0 ? 18 : 11;
        return `/F1 ${size} Tf\n1 0 0 1 50 ${y} Tm\n(${this.escapePdfText(line)}) Tj`;
      })
      .join('\n');

    const stream = `BT\n${textObjects}\nET`;
    const objects = [
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
      '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
      `5 0 obj\n<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream\nendobj\n`,
    ];

    const header = '%PDF-1.4\n';
    const offsets: number[] = [];
    let currentOffset = Buffer.byteLength(header, 'utf8');

    for (const object of objects) {
      offsets.push(currentOffset);
      currentOffset += Buffer.byteLength(object, 'utf8');
    }

    const xrefOffset = currentOffset;
    let xref = 'xref\n0 6\n0000000000 65535 f \n';
    for (const offset of offsets) {
      xref += `${offset.toString().padStart(10, '0')} 00000 n \n`;
    }

    const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(header + objects.join('') + xref + trailer, 'utf8');
  }

  private escapePdfText(text: string): string {
    return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }
}