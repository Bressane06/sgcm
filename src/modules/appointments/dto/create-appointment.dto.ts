import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentType } from '../enum/appointment-type.enum';

export class CreateAppointmentDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  scheduleId!: number;

  @ApiProperty({ enum: AppointmentType, example: AppointmentType.CONSULTATION })
  @IsEnum(AppointmentType)
  type!: AppointmentType;

  @ApiPropertyOptional({ example: 'Dor de cabeça e febre' })
  @ValidateIf(
    (dto: CreateAppointmentDto) => dto.type === AppointmentType.CONSULTATION,
  )
  @IsString()
  @IsNotEmpty()
  consultationReason?: string;

  @ApiPropertyOptional({ example: 'Gripe' })
  @ValidateIf(
    (dto: CreateAppointmentDto) => dto.type === AppointmentType.CONSULTATION,
  )
  @IsString()
  @IsNotEmpty()
  diagnosis?: string;

  @ApiPropertyOptional({ example: 'Paracetamol 500mg de 8/8h' })
  @ValidateIf(
    (dto: CreateAppointmentDto) => dto.type === AppointmentType.CONSULTATION,
  )
  @IsString()
  @IsNotEmpty()
  prescription?: string;

  @ApiPropertyOptional({ example: 'Hemograma completo' })
  @ValidateIf((dto: CreateAppointmentDto) => dto.type === AppointmentType.EXAM)
  @IsString()
  @IsNotEmpty()
  examName?: string;

  @ApiPropertyOptional({ example: 'Resultados dentro dos limites esperados' })
  @ValidateIf((dto: CreateAppointmentDto) => dto.type === AppointmentType.EXAM)
  @IsString()
  @IsNotEmpty()
  result?: string;

  @ApiPropertyOptional({ example: 'Jejum de 8 horas exigido' })
  @ValidateIf((dto: CreateAppointmentDto) => dto.type === AppointmentType.EXAM)
  @IsString()
  @IsNotEmpty()
  observations?: string;

  @ApiPropertyOptional({ example: 'Retornar em duas semanas' })
  @ValidateIf(
    (dto: CreateAppointmentDto) => dto.type === AppointmentType.FOLLOW_UP,
  )
  @IsString()
  @IsNotEmpty()
  notes?: string;

  @ApiPropertyOptional({ example: 'Reavaliar sintomas e ajustar medicação' })
  @ValidateIf(
    (dto: CreateAppointmentDto) => dto.type === AppointmentType.FOLLOW_UP,
  )
  @IsString()
  @IsNotEmpty()
  nextSteps?: string;
}
