import { ApiProperty } from '@nestjs/swagger';
import { ScheduleType } from '../enum/schedule-type.enum';

export class CreateInPersonScheduleDto {
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
    example: ScheduleType.IN_PERSON,
  })
  type!: ScheduleType;

  @ApiProperty({
    example: '102',
    description: 'Sala onde ocorrerá a consulta',
  })
  room!: string;

  @ApiProperty({
    example: 'Unidade Central',
    description: 'Unidade de atendimento',
  })
  unit!: string;
}
