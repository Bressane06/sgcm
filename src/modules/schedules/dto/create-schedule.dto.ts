import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ScheduleType } from '../enum/schedule-type.enum';

export class CreateScheduleDto {
  @ApiProperty({
    example: '2026-05-10T09:00:00.000Z',
  })
  @IsDateString()
  scheduledAt!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  doctorId!: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  patientId!: number;

  @ApiProperty({ enum: ScheduleType, example: ScheduleType.IN_PERSON })
  @IsEnum(ScheduleType)
  type!: ScheduleType;

  @ApiPropertyOptional({ example: '102' })
  @ValidateIf((dto: CreateScheduleDto) => dto.type === ScheduleType.IN_PERSON)
  @IsString()
  @IsNotEmpty()
  room?: string;

  @ApiPropertyOptional({ example: 'Unidade Central' })
  @ValidateIf((dto: CreateScheduleDto) => dto.type === ScheduleType.IN_PERSON)
  @IsString()
  @IsNotEmpty()
  unit?: string;

  @ApiPropertyOptional({ example: 'https://meet.example.com/consulta-123' })
  @ValidateIf((dto: CreateScheduleDto) => dto.type === ScheduleType.ONLINE)
  @IsString()
  @IsNotEmpty()
  accessLink?: string;

  @ApiPropertyOptional({ example: 'Google Meet' })
  @ValidateIf((dto: CreateScheduleDto) => dto.type === ScheduleType.ONLINE)
  @IsString()
  @IsNotEmpty()
  platform?: string;

  @ApiPropertyOptional({
    example: 'Rua das Flores, 123, Centro, Três Lagoas - MS',
  })
  @ValidateIf((dto: CreateScheduleDto) => dto.type === ScheduleType.HOME)
  @IsString()
  @IsNotEmpty()
  fullAddress?: string;

  @ApiPropertyOptional({ example: 'Tocar campainha no portão azul.' })
  @IsOptional()
  @IsString()
  accessNotes?: string;
}