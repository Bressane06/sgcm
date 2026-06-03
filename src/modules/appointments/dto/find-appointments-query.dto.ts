import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { AppointmentStatus } from '../enum/appointment-status.enum';
import { AppointmentType } from '../enum/appointment-type.enum';

export class FindAppointmentsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'ID do agendamento relacionado ao atendimento',
    example: 7,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  scheduleId?: number;

  @ApiPropertyOptional({
    description: 'Status do atendimento',
    enum: AppointmentStatus,
  })
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Tipo do atendimento',
    enum: AppointmentType,
  })
  @IsEnum(AppointmentType)
  @IsOptional()
  type?: AppointmentType;

  @ApiPropertyOptional({
    description: 'ID do médico',
    example: 4,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  doctorId?: number;

  @ApiPropertyOptional({
    description: 'ID do paciente',
    example: 7,
    type: Number,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  patientId?: number;
}