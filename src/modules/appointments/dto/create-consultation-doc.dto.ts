import { ApiProperty } from '@nestjs/swagger';
import { AppointmentType } from '../enum/appointment-type.enum';

export class CreateConsultationDto {
  @ApiProperty({ example: 1 })
  scheduleId!: number;

  @ApiProperty({
    enum: AppointmentType,
    example: AppointmentType.CONSULTATION,
  })
  type!: AppointmentType.CONSULTATION;

  @ApiProperty({ example: 'Dor de cabeça e febre' })
  reason!: string;

  @ApiProperty({ example: 'Gripe' })
  diagnosticHypothesis!: string;

  @ApiProperty({ example: 'Paracetamol 500mg de 8/8h' })
  prescription!: string;
}
