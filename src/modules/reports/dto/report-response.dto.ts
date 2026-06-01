import { ApiProperty } from '@nestjs/swagger';
import { ReportStatus } from '../enum/report-status.enum';
import { ReportDoctorDto } from './report-doctor.dto';
import { ReportPersonDto } from './report-person.dto';

export class ReportResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 42 })
  appointmentId!: number;

  @ApiProperty({ example: '9a1b6f8e-0c10-4c20-98f4-7b6a4c4fd1ef' })
  validationCode!: string;

  @ApiProperty({ enum: ReportStatus, example: ReportStatus.ACTIVE })
  status!: ReportStatus;

  @ApiProperty({ type: ReportPersonDto })
  patient!: ReportPersonDto;

  @ApiProperty({ type: ReportDoctorDto })
  doctor!: ReportDoctorDto;

  @ApiProperty({ example: 'MRI' })
  examType!: string;

  @ApiProperty({ example: 'Exame sem alterações relevantes.' })
  result!: string;

  @ApiProperty({ example: '2026-06-01T10:00:00.000Z' })
  issuedAt!: Date;

  @ApiProperty({ example: null, nullable: true })
  revokedReason!: string | null;

  @ApiProperty({ example: null, nullable: true })
  revokedAt!: Date | null;

  @ApiProperty({ example: null, nullable: true })
  revokedBy!: number | null;
}