import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ScheduleStatus } from '../enum/schedule-status.enum';
import { ScheduleType } from '../enum/schedule-type.enum';

export class FindRelatedSchedulesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ScheduleStatus })
  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;

  @ApiPropertyOptional({ enum: ScheduleType })
  @IsOptional()
  @IsEnum(ScheduleType)
  type?: ScheduleType;

  @ApiPropertyOptional({ example: '2026-05-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-05-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}