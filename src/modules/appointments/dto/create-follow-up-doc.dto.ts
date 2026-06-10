import { ApiProperty } from '@nestjs/swagger';
import { AppointmentType } from '../enum/appointment-type.enum';

export class CreateFollowUpDto {
  @ApiProperty({ example: 1 })
  scheduleId!: number;

  @ApiProperty({
    enum: AppointmentType,
    example: AppointmentType.FOLLOW_UP,
  })
  type!: AppointmentType.FOLLOW_UP;

  @ApiProperty({ example: 'Retornar em duas semanas' })
  notes!: string;

  @ApiProperty({
    example: 'Reavaliar sintomas e ajustar medicação',
  })
  nextSteps!: string;
}
