import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOperator,
  LessThanOrEqual,
  MoreThanOrEqual,
  SelectQueryBuilder,
  Repository,
} from 'typeorm';
import { Schedule } from '../../schedules/entities/schedule.entity';
import { ScheduleStatus } from '../../schedules/enum/schedule-status.enum';
import { ScheduleType } from '../../schedules/enum/schedule-type.enum';
import { AdminSchedulesReportQueryDto } from '../dto/admin-schedules-report-query.dto';
import { AdminSchedulesReportDto } from '../dto/admin-schedules-report.dto';
import {
  ScheduleDateFilter,
  ScheduleReportCountRaw,
  ScheduleReportGroupedRaw,
} from './schedule-report-raw.interface';

@Injectable()
export class AdminReportsService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async getSchedulesReport(
    query: AdminSchedulesReportQueryDto,
  ): Promise<AdminSchedulesReportDto> {
    const { startDate, endDate } = query;

    const where = this.buildDateFilter(startDate, endDate);
    const queryBuilder = this.scheduleRepository.createQueryBuilder('schedule');

    this.applyDateFilter(queryBuilder, where);

    // Executa as agregações em paralelo:
    // - total de agendamentos
    // - distribuição por status
    // - distribuição por tipo
    const [rawTotal, byStatusRows, byTypeRows] = await Promise.all([
      queryBuilder.clone().select('COUNT(schedule.id)', 'total').getRawOne<ScheduleReportCountRaw>(),
      queryBuilder
        .clone()
        .select('schedule.status', 'key')
        .addSelect('COUNT(*)', 'count')
        .groupBy('schedule.status')
        .getRawMany<ScheduleReportGroupedRaw>(),
      queryBuilder
        .clone()
        .select('schedule.type', 'key')
        .addSelect('COUNT(*)', 'count')
        .groupBy('schedule.type')
        .getRawMany<ScheduleReportGroupedRaw>(),
    ]);

    // Inicializa os mapas com todos os valores dos enums zerados,
    // garantindo que categorias sem registros também apareçam no relatório.
    const byStatus = this.createEmptyAggregationMap(
      Object.values(ScheduleStatus),
    ) as unknown as AdminSchedulesReportDto['byStatus'];
    const byType = this.createEmptyAggregationMap(
      Object.values(ScheduleType),
    ) as unknown as AdminSchedulesReportDto['byType'];

    for(const row of byStatusRows) {
      const key = row.key as ScheduleStatus;
      byStatus[key] = Number(row.count);
    }

    for (const row of byTypeRows) {
      const key = row.key as ScheduleType;
      byType[key] = Number(row.count);
    }

    return {
      period: {
        startDate: startDate ?? null,
        endDate: endDate ?? null,
      },
      total: Number(rawTotal?.total ?? 0),
      byStatus,
      byType,
    };
  }

  private buildDateFilter(startDate?: string, endDate?: string): ScheduleDateFilter {
    if(startDate && endDate) 
      return { scheduledAt: Between(new Date(startDate), new Date(endDate)) };

    if (startDate) 
      return { scheduledAt: MoreThanOrEqual(new Date(startDate)) };

    if (endDate) 
      return { scheduledAt: LessThanOrEqual(new Date(endDate)) };

    return {};
  }

  private applyDateFilter(
    queryBuilder: SelectQueryBuilder<Schedule>,
    filter: ScheduleDateFilter,
  ): void {
    if (filter.scheduledAt)
      queryBuilder.where({ scheduledAt: filter.scheduledAt });
    
  }

  // Isso foi feito para garantir que mesmo categorias sem registros apareçam no relatório, 
  //    com contagem zero.
  private createEmptyAggregationMap<T extends string>(
    values: readonly T[],
  ): Record<T, number> {
    const accumulator = {} as Record<T, number>;

    for (const value of values) {
      accumulator[value] = 0;
    }

    return accumulator;
  }
}