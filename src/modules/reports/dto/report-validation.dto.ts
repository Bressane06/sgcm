import { ApiProperty } from '@nestjs/swagger';
import { ReportStatus } from '../enum/report-status.enum';

export class ReportValidationDto {
  @ApiProperty({ example: '9a1b6f8e-0c10-4c20-98f4-7b6a4c4fd1ef' })
  validationCode!: string;

  @ApiProperty({ enum: ReportStatus, example: ReportStatus.ACTIVE })
  status!: ReportStatus;

  @ApiProperty({ example: true })
  revoked!: boolean;

  @ApiProperty({ example: 'Maria Souza' })
  patientName!: string;

  @ApiProperty({ example: 'Dr. João Silva' })
  doctorName!: string;

  @ApiProperty({ example: 'MRI' })
  examType!: string;

  @ApiProperty({ example: '2026-06-01T10:00:00.000Z' })
  issuedAt!: Date;

  @ApiProperty({ example: null, nullable: true })
  revokedAt!: Date | null;
}