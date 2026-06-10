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
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ example: 'Gripe' })
  @IsString()
  @IsOptional()
  diagnosticHypothesis?: string;

  @ApiPropertyOptional({ example: 'Paracetamol 500mg de 8/8h' })
  @IsString()
  @IsOptional()
  prescription?: string;

  @ApiPropertyOptional({ example: 'Hemograma completo' })
  @IsString()
  @IsOptional()
  examName?: string;

  @ApiPropertyOptional({ example: 'Resultados dentro dos limites esperados' })
  @IsString()
  @IsOptional()
  result?: string;

  @ApiPropertyOptional({ example: 'Jejum de 8 horas exigido' })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiPropertyOptional({ example: 'Retornar em duas semanas' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'Reavaliar sintomas e ajustar medicação' })
  @IsString()
  @IsOptional()
  nextSteps?: string;
}
