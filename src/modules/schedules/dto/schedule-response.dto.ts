import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScheduleStatus } from '../enum/schedule-status.enum';
import { ScheduleType } from '../enum/schedule-type.enum';

export class ScheduleResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: '2026-05-10T09:00:00.000Z' })
  scheduledAt!: Date;

  @ApiProperty({ enum: ScheduleStatus, example: ScheduleStatus.PENDING })
  status!: ScheduleStatus;

  @ApiProperty({ enum: ScheduleType, example: ScheduleType.IN_PERSON })
  type!: ScheduleType;

  @ApiProperty({ example: 1 })
  doctorId!: number;

  @ApiProperty({ example: 2 })
  patientId!: number;

  @ApiPropertyOptional({ example: '102' })
  room?: string;

  @ApiPropertyOptional({ example: 'Unidade Central' })
  unit?: string;

  @ApiPropertyOptional({ example: 'https://meet.example.com/consulta-123' })
  accessLink?: string;

  @ApiPropertyOptional({ example: 'Google Meet' })
  platform?: string;

  @ApiPropertyOptional({
    example: 'Rua das Flores, 123, Centro, Três Lagoas - MS',
  })
  fullAddress?: string;

  @ApiPropertyOptional({ example: 'Tocar campainha no portão azul.' })
  accessNotes?: string;

  @ApiPropertyOptional({ example: '2026-05-09T02:03:41.588Z' })
  cancelledAt?: Date;

  @ApiPropertyOptional({ example: 'Paciente solicitou cancelamento.' })
  cancellationReason?: string;

  @ApiPropertyOptional({ example: 'SYSTEM' })
  cancelledBy?: string;

  @ApiProperty({ example: '2026-05-09T01:49:40.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-05-09T02:03:41.000Z' })
  updatedAt!: Date;
}