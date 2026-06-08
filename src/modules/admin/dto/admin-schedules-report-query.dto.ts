import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsOptional,
  Validate,
} from 'class-validator';
import { IsDateRangeValidConstraint } from './validators/is-date-range-valid.constraint';

export class AdminSchedulesReportQueryDto {
  @ApiPropertyOptional({ example: '2026-05-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  @Type(() => String)
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-05-31T23:59:59.999Z' })
  @IsOptional()
  @IsDateString()
  @Validate(IsDateRangeValidConstraint)
  endDate?: string;
}