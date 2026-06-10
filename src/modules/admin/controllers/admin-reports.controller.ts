import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ApiAuthResponses } from '../../../common/swagger';
import { AdminSchedulesReportDto } from '../dto/admin-schedules-report.dto';
import { UserType } from '../../users/enum/user-type.enum';
import { AdminSchedulesReportQueryDto } from '../dto/admin-schedules-report-query.dto';
import { AdminReportsService } from '../services/admin-reports.service';
import { AdminAppointmentsReportDto } from '../dto/admin-appointments-report.dto';
import { AdminAppointmentsReportQueryDto } from '../dto/admin-appointments-report-query.dto';
import { OccupationQueryDto } from '../dto/occupation-query.dto';
import { DoctorOccupationReportDto } from '../dto/doctor-occupation-report.dto';
import { AdminProceduresReportDto } from '../dto/admin-procedures-reports.dto';

@ApiTags('Admin Reports')
@Controller('admin/reports')
@Roles(UserType.ADMIN)
@ApiAuthResponses({
  instance: '/admin/reports/schedules',
  unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
})
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Get('schedules')
  @ApiOperation({ summary: 'Gerar relatório de agendamentos' })
  @ApiOkResponse({ type: AdminSchedulesReportDto })
  async getSchedulesReport(
    @Query() query: AdminSchedulesReportQueryDto,
  ): Promise<AdminSchedulesReportDto> {
    return this.adminReportsService.getSchedulesReport(query);
  }

  @Get('appointments')
  @ApiOperation({ summary: 'Gerar relatório de atendimentos' })
  @ApiOkResponse({ type: AdminAppointmentsReportDto })
  async getAppointmentsReport(
    @Query() query: AdminAppointmentsReportQueryDto,
  ): Promise<AdminAppointmentsReportDto> {
    return this.adminReportsService.getAppointmentsReport(query);
  }

  @Get('doctors/:id/occupation')
  @Roles(UserType.ADMIN)
  @ApiOperation({
    summary: 'Taxa de ocupação da agenda de um médico',
    description:
      'Retorna a ocupação da agenda do médico no período informado.\n\n' +
      '**Fórmula da taxa de ocupação:**\n\n' +
      '`occupationRate = (COMPLETED / total) * 100`\n\n' +
      'O denominador inclui todos os agendamentos criados no período ' +
      '(PENDING + CONFIRMED + CANCELLED + COMPLETED), representando ' +
      'a demanda real. O numerador considera apenas agendamentos ' +
      'COMPLETED, que efetivamente geraram um atendimento clínico.',
  })
  @ApiOkResponse({ type: DoctorOccupationReportDto })
  async getDoctorOccupation(
    @Param('id') id: number,
    @Query() query: OccupationQueryDto,
  ) {
    return this.adminReportsService.getDoctorOccupation(Number(id), query);
  }

  @Get('procedures')
  @ApiOperation({
    summary: 'Gerar relatório de procedimentos',
  })
  @ApiOkResponse({
    type: AdminProceduresReportDto,
  })
  async getProceduresReport(): Promise<AdminProceduresReportDto> {
    return this.adminReportsService.getProceduresReport();
  }
}
