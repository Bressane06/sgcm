import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '../enum/appointment-status.enum';
import { AppointmentType } from '../enum/appointment-type.enum';

export class AppointmentResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ enum: AppointmentStatus, example: AppointmentStatus.IN_PROGRESS })
  status!: AppointmentStatus;

  @ApiProperty({ enum: AppointmentType, example: AppointmentType.CONSULTATION })
  type!: AppointmentType;

  @ApiProperty({ example: 1 })
  scheduleId!: number;

  @ApiProperty({ example: '2026-05-10T09:00:00.000Z' })
  scheduledAt!: Date;

  @ApiProperty({ example: 1 })
  doctorId!: number;

  @ApiProperty({ example: 2 })
  patientId!: number;

  @ApiPropertyOptional({ example: 'Dor de cabeça e febre' })
  reason?: string;

  @ApiPropertyOptional({ example: 'Gripe' })
  diagnosticHypothesis?: string;

  @ApiPropertyOptional({ example: 'Paracetamol 500mg de 8/8h' })
  prescription?: string;

  @ApiPropertyOptional({ example: 'Hemograma completo' })
  examName?: string;

  @ApiPropertyOptional({ example: 'Resultados dentro dos limites esperados' })
  result?: string;

  @ApiPropertyOptional({ example: 'Jejum de 8 horas exigido' })
  observations?: string;

  @ApiPropertyOptional({ example: 'Retornar em duas semanas' })
  notes?: string;

  @ApiPropertyOptional({ example: 'Reavaliar sintomas e ajustar medicação' })
  nextSteps?: string;

  @ApiProperty({ example: '2026-05-09T01:49:40.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-05-09T02:03:41.000Z' })
  updatedAt!: Date;
}
