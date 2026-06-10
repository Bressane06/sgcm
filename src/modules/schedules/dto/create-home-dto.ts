import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScheduleType } from '../enum/schedule-type.enum';

export class CreateHomeScheduleDto {
  @ApiProperty({
    example: '2026-05-10T09:00:00.000Z',
    description: 'Data e horário do atendimento',
  })
  scheduledAt!: string;

  @ApiProperty({
    example: 1,
    description: 'Identificador do médico',
  })
  doctorId!: number;

  @ApiProperty({
    example: 2,
    description: 'Identificador do paciente',
  })
  patientId!: number;

  @ApiProperty({
    enum: ScheduleType,
    example: ScheduleType.HOME,
  })
  type!: ScheduleType;

  @ApiProperty({
    example: 'Rua das Flores, 123, Centro, Três Lagoas - MS',
    description: 'Endereço completo da visita domiciliar',
  })
  fullAddress!: string;

  @ApiPropertyOptional({
    example: 'Tocar campainha no portão azul.',
    description: 'Informações adicionais para acesso ao local',
  })
  accessNotes?: string;
}
