import { FindOperator } from 'typeorm';

export interface ScheduleReportCountRaw {
  total: string | number;
}

export interface ScheduleReportGroupedRaw {
  key: string;
  count: string | number;
}

export interface ScheduleDateFilter {
  scheduledAt?: FindOperator<Date>;
}