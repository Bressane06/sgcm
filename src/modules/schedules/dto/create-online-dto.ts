import { ApiProperty } from '@nestjs/swagger';
import { ScheduleType } from '../enum/schedule-type.enum';

export class CreateOnlineScheduleDto {
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
    example: ScheduleType.ONLINE,
  })
  type!: ScheduleType;

  @ApiProperty({
    example: 'https://meet.google.com/abc-defg-hij',
    description: 'Link de acesso à consulta online',
  })
  accessLink!: string;

  @ApiProperty({
    example: 'Google Meet',
    description: 'Plataforma utilizada para a consulta',
  })
  platform!: string;
}
