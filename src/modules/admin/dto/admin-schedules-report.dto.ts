import { ApiProperty } from '@nestjs/swagger';

class AdminSchedulesReportByStatusDto {
  @ApiProperty({ example: 12 })
  PENDING!: number;

  @ApiProperty({ example: 8 })
  CONFIRMED!: number;

  @ApiProperty({ example: 3 })
  CANCELLED!: number;

  @ApiProperty({ example: 5 })
  COMPLETED!: number;
}

class AdminSchedulesReportByTypeDto {
  @ApiProperty({ example: 10 })
  IN_PERSON!: number;

  @ApiProperty({ example: 7 })
  ONLINE!: number;

  @ApiProperty({ example: 11 })
  HOME!: number;
}

class AdminSchedulesReportPeriodDto {
  @ApiProperty({
    example: '2026-05-01T00:00:00.000Z',
    nullable: true,
  })
  startDate!: string | null;

  @ApiProperty({
    example: '2026-05-31T23:59:59.999Z',
    nullable: true,
  })
  endDate!: string | null;
}

export class AdminSchedulesReportDto {
  @ApiProperty({ type: AdminSchedulesReportPeriodDto })
  period!: AdminSchedulesReportPeriodDto;

  @ApiProperty({ example: 25 })
  total!: number;

  @ApiProperty({ type: AdminSchedulesReportByStatusDto })
  byStatus!: AdminSchedulesReportByStatusDto;

  @ApiProperty({ type: AdminSchedulesReportByTypeDto })
  byType!: AdminSchedulesReportByTypeDto;
}