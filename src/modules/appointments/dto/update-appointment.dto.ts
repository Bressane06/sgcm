import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentType } from '../enum/appointment-type.enum';

export class UpdateAppointmentDto {
  @ApiPropertyOptional({
    enum: AppointmentType,
    example: AppointmentType.CONSULTATION,
  })
  @IsEnum(AppointmentType)
  @IsOptional()
  type?: AppointmentType;

  @ApiPropertyOptional({ example: 'Dor de cabeça e febre' })
  @ValidateIf(
    (dto: UpdateAppointmentDto) => dto.type === AppointmentType.CONSULTATION,
  )
  @IsString()
  @IsOptional()
  consultationReason?: string;

  @ApiPropertyOptional({ example: 'Gripe' })
  @ValidateIf(
    (dto: UpdateAppointmentDto) => dto.type === AppointmentType.CONSULTATION,
  )
  @IsString()
  @IsOptional()
  diagnosis?: string;

  @ApiPropertyOptional({ example: 'Paracetamol 500mg de 8/8h' })
  @ValidateIf(
    (dto: UpdateAppointmentDto) => dto.type === AppointmentType.CONSULTATION,
  )
  @IsString()
  @IsOptional()
  prescription?: string;

  @ApiPropertyOptional({ example: 'Hemograma completo' })
  @ValidateIf((dto: UpdateAppointmentDto) => dto.type === AppointmentType.EXAM)
  @IsString()
  @IsOptional()
  examName?: string;

  @ApiPropertyOptional({ example: 'Resultados dentro dos limites esperados' })
  @ValidateIf((dto: UpdateAppointmentDto) => dto.type === AppointmentType.EXAM)
  @IsString()
  @IsOptional()
  result?: string;

  @ApiPropertyOptional({ example: 'Jejum de 8 horas exigido' })
  @ValidateIf((dto: UpdateAppointmentDto) => dto.type === AppointmentType.EXAM)
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiPropertyOptional({ example: 'Retornar em duas semanas' })
  @ValidateIf(
    (dto: UpdateAppointmentDto) => dto.type === AppointmentType.FOLLOW_UP,
  )
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'Reavaliar sintomas e ajustar medicação' })
  @ValidateIf(
    (dto: UpdateAppointmentDto) => dto.type === AppointmentType.FOLLOW_UP,
  )
  @IsString()
  @IsOptional()
  nextSteps?: string;
}
