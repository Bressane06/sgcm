import { Injectable, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Buffer } from 'buffer';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
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
import { FindReportsQueryDto } from './dto/find-reports-query.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async create(
    appointmentId: number,
    dto: CreateReportDto,
    currentUser: UserPayload,
  ): Promise<ReportResponseDto> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: { schedule: true},
    });

    if(!appointment){
      throw new NotFoundException('Atendimento', appointmentId);
    }

    await this.assertCanAccessAppointment(appointment, currentUser);

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

    const pdf = await this.buildPdfBuffer(report);
    return new StreamableFile(pdf, {
      type: 'application/pdf',
      disposition:`attachment; filename="laudo-${report.validationCode}.pdf"`,
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

  // async findAppointments(
  //   id: number,
  //   query: FindReportsQueryDto,
  //   currentUser: UserPayload,
  // ): Promise<PaginatedResponse<ReportResponseDto>> {
    
  //   const appointment = await this.appointmentRepository.findOne({
  //     where: { id },
  //     relations: { schedule: true },
  //   });

  //   if (!appointment) {
  //     throw new NotFoundException('Atendimento', id);
  //   }

  //   await this.assertCanAccessAppointment(appointment, currentUser);

  //   const { page, limit, sort, status } = query;
  //   const skip = (page - 1) * limit;
  //   const [field, direction] = sort ? sort.split(':') : ['issuedAt', 'DESC'];

  //   const where: any = { appointmentId: id };
  //   if (status) {
  //     where.status = status;
  //   }

  //   const [reports, totalItems] = await this.reportRepository.findAndCount({
  //     where,
  //     order: { [field]: direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC' },
  //     skip,
  //     take: limit,
  //     relations: { patient: { user: true }, doctor: { user: true } },
  //   });

  //   return {
  //     data: reports.map((report) => this.toResponseDto(report)),
  //     meta: {
  //       totalItems,
  //       page,
  //       limit,
  //       totalPages: Math.ceil(totalItems / limit),
  //     },
  //   };
  // }

  async findByPatient(
    id: number,
    query: FindReportsQueryDto,
    currentUser: UserPayload,
  ): Promise<PaginatedResponse<ReportResponseDto>> {
    const patient = await this.findPatientOrFail(id);
    await this.assertCanAccessPatient(patient, currentUser);

    const { page, limit, sort, status } = query;
    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['issuedAt', 'DESC'];

    const where: any = { patientId: id };
    if (status) {
      where.status = status;
    }

    const [reports, totalItems] = await this.reportRepository.findAndCount({
      where,
      order: { [field]: direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC' },
      skip,
      take: limit,
      relations: { patient: { user: true }, doctor: { user: true } },
    });

    return {
      data: reports.map((report) => this.toResponseDto(report)),
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findByDoctor(
    id: number,
    query: FindReportsQueryDto,
    currentUser: UserPayload,
  ): Promise<PaginatedResponse<ReportResponseDto>> {
    const doctor = await this.findDoctorOrFail(id);
    await this.assertCanAccessDoctor(doctor, currentUser);

    const { page, limit, sort, status } = query;
    const skip = (page - 1) * limit;
    const [field, direction] = sort ? sort.split(':') : ['issuedAt', 'DESC'];

    const where: any = { doctorId: id };
    if (status) {
      where.status = status;
    }

    const [reports, totalItems] = await this.reportRepository.findAndCount({
      where,
      order: { [field]: direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC' },
      skip,
      take: limit,
      relations: { patient: { user: true }, doctor: { user: true } },
    });

    return {
      data: reports.map((report) => this.toResponseDto(report)),
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
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

    if (currentUser.type === UserType.DOCTOR) {
      const currentDoctor = await this.findDoctorByUserIdOrFail(currentUser.sub);
      
      const hasReports = await this.reportRepository.exists({
        where: {
          patientId: patient.id,
          issuedByDoctorId: currentDoctor.id,
        },
      });

      if (hasReports) {
        return;
      }
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

  private async assertCanAccessAppointment(
    appointment: Appointment,
    currentUser: UserPayload,
  ): Promise<void> {
    
    if (currentUser.type === UserType.ADMIN) {
      return;
    }

    if (currentUser.type === UserType.PATIENT) {
      const patient = await this.patientRepository.findOne({
        where: { user: { id: currentUser.sub } },
      });

      if (patient && appointment.schedule.patientId === patient.id) {
        return;
      }
    }

    if (currentUser.type === UserType.DOCTOR) {
      const doctor = await this.findDoctorByUserIdOrFail(currentUser.sub);

      if (doctor && appointment.schedule.doctorId === doctor.id) {
        return;
      }
    }

    throw new ForbiddenException('Você não tem permissão para acessar os laudos deste atendimento.'); 
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

  private async buildPdfBuffer(report: Report): Promise<Buffer> {
    const validationUrl = this.getValidationUrl(report.validationCode);
    const qrCodeBuffer = await QRCode.toBuffer(validationUrl, {
      type: 'png',
      width: 130,
      margin: 1,
      errorCorrectionLevel: 'M',
    });

    const pageWidth = 595.28;    // A4 em pontos
    const pageHeight = 841.89;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;  // 495.28
    const qrSize = 130;
    const qrX = pageWidth - margin - qrSize;      // canto inferior direito
    const qrY = pageHeight - margin - qrSize - 20; // reserva espaço pra legenda

    return await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer | Uint8Array) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ── Cabeçalho centralizado ──────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('CLÍNICA MÉDICA', margin, margin, { width: contentWidth, align: 'center' });

      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('gray')
        .text('Laudo Médico', { width: contentWidth, align: 'center' });

      doc.fillColor('black').moveDown(0.5);

      // Linha separadora
      const lineY = doc.y;
      doc
        .moveTo(margin, lineY)
        .lineTo(pageWidth - margin, lineY)
        .strokeColor('#cccccc')
        .lineWidth(0.5)
        .stroke();

      doc.moveDown(1);

      // ── Campos justificados ─────────────────────────────────────────────
      const fields: [string, string | null | undefined][] = [
        ['Paciente',           report.patient.user.name],
        ['Médico',             `${report.doctor.user.name} | CRM: ${report.doctor.crm}`],
        ['Tipo de exame',      report.examType],
        ['Resultado',          report.result],
        ['Data de emissão',    report.issuedAt.toLocaleString('pt-BR')],
        ['Status',             this.reportStatusLabels[report.status]],
        ['Código de validação', report.validationCode],
        ['Link de validação',  validationUrl],
      ];

      if (report.status === ReportStatus.REVOKED) {
        if (report.revokedAt) {
          fields.push(['Revogado em', report.revokedAt.toLocaleString('pt-BR')]);
        }
        if (report.revokedReason) {
          fields.push(['Motivo da revogação', report.revokedReason]);
        }
      }

      doc.font('Helvetica').fontSize(11);

      for (const [label, value] of fields) {
        if (!value) continue;

        // Label em bold + valor justificado na mesma largura
        const labelText = `${label}: `;
        doc.font('Helvetica-Bold').text(labelText, { continued: true, width: contentWidth, align: 'justify' });
        doc.font('Helvetica').text(value, { width: contentWidth, align: 'justify' });
        doc.moveDown(0.3);
      }

      // ── QR Code — canto inferior direito ───────────────────────────────
      doc.image(qrCodeBuffer, qrX, qrY, { width: qrSize });
      doc
        .fontSize(8)
        .fillColor('gray')
        .text('Valide este laudo com o QR code', qrX - 5, qrY + qrSize + 4, {
          width: qrSize + 10,
          align: 'center',
        });

      // ── Rodapé ─────────────────────────────────────────────────────────
      const footerY = pageHeight - margin + 8;
      doc
        .moveTo(margin, footerY - 10)
        .lineTo(pageWidth - margin, footerY - 10)
        .strokeColor('#cccccc')
        .lineWidth(0.5)
        .stroke();

      doc
        .fontSize(8)
        .fillColor('gray')
        .text(
          'Este documento é válido somente com o código de validação acima.',
          margin,
          footerY,
          { width: contentWidth, align: 'center' },
        );

      doc.end();
    });
  }

  private readonly reportStatusLabels: Record<ReportStatus, string> = {
    [ReportStatus.ACTIVE]: 'Ativo',
    [ReportStatus.REVOKED]: 'Revogado',
  };

  private getValidationUrl(code: string): string {
    const publicApiBaseUrl = (process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
    return `${publicApiBaseUrl}/reports/validate/${code}`;
  }
}