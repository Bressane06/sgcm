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
import { Appointment } from '../../appointments/entities/appointment.entity';
import { AppointmentStatus } from '../../appointments/enum/appointment-status.enum';
import { AppointmentType } from '../../appointments/enum/appointment-type.enum';
import { AdminSchedulesReportQueryDto } from '../dto/admin-schedules-report-query.dto';
import { AdminSchedulesReportDto } from '../dto/admin-schedules-report.dto';
import { AdminAppointmentsReportQueryDto } from '../dto/admin-appointments-report-query.dto';
import { AdminAppointmentsReportDto } from '../dto/admin-appointments-report.dto';
import {
  ScheduleDateFilter,
  ScheduleReportCountRaw,
  ScheduleReportGroupedRaw,
} from './schedule-report-raw.interface';

interface AppointmentDateFilter {
  createdAt?: FindOperator<Date>;
}

@Injectable()
export class AdminReportsService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async getSchedulesReport(
    query: AdminSchedulesReportQueryDto,
  ): Promise<AdminSchedulesReportDto> {
    const { startDate, endDate } = query;

    const where = this.buildDateFilter(startDate, endDate);
    const queryBuilder = this.scheduleRepository.createQueryBuilder('schedule');

    this.applyDateFilter(queryBuilder, where);

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

  async getAppointmentsReport(
    query: AdminAppointmentsReportQueryDto,
  ): Promise<AdminAppointmentsReportDto> {
    const { startDate, endDate } = query;

    const where = this.buildAppointmentDateFilter(startDate, endDate);
    const queryBuilder = this.appointmentRepository.createQueryBuilder('appointment');

    this.applyAppointmentDateFilter(queryBuilder, where);

    const [rawTotal, byStatusRows, byTypeRows] = await Promise.all([
      queryBuilder.clone().select('COUNT(appointment.id)', 'total').getRawOne(),
      queryBuilder
        .clone()
        .select('appointment.status', 'key')
        .addSelect('COUNT(*)', 'count')
        .groupBy('appointment.status')
        .getRawMany(),
      queryBuilder
        .clone()
        .select('appointment.type', 'key')
        .addSelect('COUNT(*)', 'count')
        .groupBy('appointment.type')
        .getRawMany(),
    ]);

    const byStatus = this.createEmptyAggregationMap(
      Object.values(AppointmentStatus),
    ) as unknown as AdminAppointmentsReportDto['byStatus'];
    const byType = this.createEmptyAggregationMap(
      Object.values(AppointmentType),
    ) as unknown as AdminAppointmentsReportDto['byType'];

    for (const row of byStatusRows) 
      byStatus[row.key as AppointmentStatus] = Number(row.count);

    for (const row of byTypeRows) 
      byType[row.key as AppointmentType] = Number(row.count);
    

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

  private buildAppointmentDateFilter(startDate?: string, endDate?: string): AppointmentDateFilter {
    if(startDate && endDate)
      return { createdAt: Between(new Date(startDate), new Date(endDate)) };

    if (startDate)
      return { createdAt: MoreThanOrEqual(new Date(startDate)) };

    if (endDate)
      return { createdAt: LessThanOrEqual(new Date(endDate)) };

    return {};
  }
  
  private applyDateFilter(
    queryBuilder: SelectQueryBuilder<Schedule>,
    filter: ScheduleDateFilter,
  ): void {
    if (filter.scheduledAt)
      queryBuilder.where({ scheduledAt: filter.scheduledAt });
  }

  private applyAppointmentDateFilter(
    queryBuilder: SelectQueryBuilder<Appointment>,
    filter: AppointmentDateFilter,
  ): void {
    if (filter.createdAt)
      queryBuilder.where({ createdAt: filter.createdAt });
  }

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
