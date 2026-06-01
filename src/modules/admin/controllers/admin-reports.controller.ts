import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ApiAuthResponses } from '../../../common/swagger';
import { AdminSchedulesReportDto } from '../dto/admin-schedules-report.dto';
import { UserType } from '../../users/enum/user-type.enum';
import { AdminSchedulesReportQueryDto } from '../dto/admin-schedules-report-query.dto';
import { AdminReportsService } from '../services/admin-reports.service';

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
}