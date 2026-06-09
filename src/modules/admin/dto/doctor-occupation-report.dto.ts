import { ApiProperty } from '@nestjs/swagger';
import { ScheduleStatus } from '../../schedules/enum/schedule-status.enum';

export class DoctorOccupationReportDto {
  @ApiProperty({ example: 1 })
  doctorId: number;

  @ApiProperty({ example: 'Dr. Gregory House' })
  doctorName: string;

  @ApiProperty({
    example: { startDate: '2026-05-01', endDate: '2026-05-31' },
    nullable: true,
  })
  period: {
    startDate: string | null;
    endDate: string | null;
  };
  @ApiProperty({
    example: 100,
    description: 'Soma de PENDING, CONFIRMED, CANCELLED e COMPLETED',
  })
  total: number;

  @ApiProperty({
    example: { PENDING: 10, CONFIRMED: 20, CANCELLED: 10, COMPLETED: 60 },
  })
  byStatus: Record<ScheduleStatus, number>;

  @ApiProperty({
    example: 60.0,
    description: 'Taxa calculada: (COMPLETED / total) * 100',
  })
  occupationRate: number;

  @ApiProperty({ example: 'Percentual de agendamentos no período...' })
  occupationRateDescription: string;
}
