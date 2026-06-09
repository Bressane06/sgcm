import { ApiProperty } from '@nestjs/swagger';
import { AppointmentType } from '../enum/appointment-type.enum';

export class CreateExamDto {
  @ApiProperty({ example: 1 })
  scheduleId!: number;

  @ApiProperty({
    enum: AppointmentType,
    example: AppointmentType.EXAM,
  })
  type!: AppointmentType.EXAM;

  @ApiProperty({ example: 'Hemograma completo' })
  examName!: string;

  @ApiProperty({ example: 'Resultados dentro dos limites esperados' })
  result!: string;

  @ApiProperty({ example: 'Jejum de 8 horas exigido' })
  observations!: string;
}
