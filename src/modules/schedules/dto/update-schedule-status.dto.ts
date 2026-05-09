import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ScheduleStatus } from '../enum/schedule-status.enum';

export class UpdateScheduleStatusDto {
  @ApiProperty({
    enum: ScheduleStatus,
    example: ScheduleStatus.CONFIRMED,
  })
  @IsEnum(ScheduleStatus)
  status!: ScheduleStatus;

  @ApiPropertyOptional({
    example: 'Paciente solicitou cancelamento.',
  })
  @ValidateIf((dto: UpdateScheduleStatusDto) => dto.status === ScheduleStatus.CANCELLED)
  @IsString()
  cancellationReason?: string;

  @ApiPropertyOptional({
    example: 'SYSTEM',
    description:
      'Campo temporário até a autenticação ser implementada na Etapa 2.',
  })
  @IsOptional()
  @IsString()
  cancelledBy?: string;
}