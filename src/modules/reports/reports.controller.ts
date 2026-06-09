import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiParam,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/is-public.decorator';
import { SkipTransform } from '../../common/decorators/skip-transform.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiAuthResponses, ApiWrappedResponse } from '../../common/swagger';
import type { UserPayload } from '../auth/models/user-payload.model';
import { CreateReportDto } from './dto/create-report.dto';
import { FindReportsQueryDto } from './dto/find-reports-query.dto';
import { ReportResponseDto } from './dto/report-response.dto';
import { ReportValidationDto } from './dto/report-validation.dto';
import { RevokeReportDto } from './dto/revoke-report.dto';
import { ReportsService } from './reports.service';
import { UserType } from '../users/enum/user-type.enum';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { Header } from '@nestjs/common';
import { ReportStatus } from './enum/report-status.enum';

@ApiTags('Reports')
@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('appointments/:id/report')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID do exame',
  })
  @ApiAuthResponses({
    instance: '/appointments/1/report',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @ApiOperation({ summary: 'Emitir laudo para um exame encerrado' })
  @ApiWrappedResponse({
    description: 'Laudo emitido com sucesso.',
    model: ReportResponseDto,
    status: HttpStatus.CREATED,
    metaExample: {
      timestamp: '2026-06-01T10:00:00.000Z',
      path: '/appointments/1/report',
    },
  })
  @ApiBadRequestResponse({ description: 'Dados inválidos.' })
  async create(
    @Param('id') id: number,
    @Body() dto: CreateReportDto,
    @CurrentUser() currentUser: UserPayload,
  ): Promise<ReportResponseDto> {
    return this.reportsService.create(Number(id), dto, currentUser);
  }

  @Get('reports/:id/pdf')
  @SkipTransform()
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="laudo.pdf"')
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID do laudo',
  })
  @ApiAuthResponses({
    instance: '/reports/1/pdf',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @ApiOperation({ summary: 'Baixar laudo em PDF' })
  @ApiProduces('application/pdf')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PDF do laudo gerado com sucesso.',
    content: {
      'application/pdf': {
        schema: { type: 'string', format: 'binary' },
      },
    },
  })
  getPdf(
    @Param('id') id: number,
    @CurrentUser() currentUser: UserPayload,
  ): Promise<StreamableFile> {
    return this.reportsService.getPdf(Number(id), currentUser);
  }

  @Get('reports/validate/:code')
  @Public()
  @ApiParam({
    name: 'code',
    type: String,
    example: '9a1b6f8e-0c10-4c20-98f4-7b6a4c4fd1ef',
  })
  @ApiOperation({ summary: 'Validar laudo por código' })
  @ApiOkResponse({ type: ReportValidationDto })
  validate(@Param('code') code: string): Promise<ReportValidationDto> {
    return this.reportsService.validate(code);
  }

  @Patch('reports/:id/revoke')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID do laudo',
  })
  @ApiAuthResponses({
    instance: '/reports/1/revoke',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @ApiOperation({ summary: 'Revogar laudo' })
  @ApiWrappedResponse({
    description: 'Laudo revogado com sucesso.',
    model: ReportResponseDto,
    metaExample: {
      timestamp: '2026-06-01T10:00:00.000Z',
      path: '/reports/1/revoke',
    },
  })
  revoke(
    @Param('id') id: number,
    @Body() dto: RevokeReportDto,
    @CurrentUser() currentUser: UserPayload,
  ): Promise<ReportResponseDto> {
    return this.reportsService.revoke(Number(id), dto, currentUser);
  }

  @Get('patients/:id/reports')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID do paciente',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    example: 'issuedAt:DESC',
  })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'REVOKED'] })
  @ApiAuthResponses({
    instance: '/patients/1/reports',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @ApiOperation({ summary: 'Listar laudos de um paciente com paginação' })
  @ApiWrappedResponse({
    description: 'Laudos do paciente retornados com sucesso.',
    model: ReportResponseDto,
    isArray: true,
    metaExample: {
      timestamp: '2026-06-01T10:00:00.000Z',
      path: '/patients/1/reports',
    },
  })
  findByPatient(
    @Param('id') id: number,
    @Query() query: FindReportsQueryDto,
    @CurrentUser() currentUser: UserPayload,
  ): Promise<PaginatedResponse<ReportResponseDto>> {
    return this.reportsService.findByPatient(Number(id), query, currentUser);
  }

  @Get('doctors/:id/reports')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID do médico',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: String,
    example: 'issuedAt:DESC',
  })
  @ApiQuery({ name: 'status', required: false, enum: ReportStatus })
  @ApiAuthResponses({
    instance: '/doctors/1/reports',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @ApiOperation({
    summary: 'Listar laudos emitidos por um médico com paginação',
  })
  @ApiWrappedResponse({
    description: 'Laudos do médico retornados com sucesso.',
    model: ReportResponseDto,
    isArray: true,
    metaExample: {
      timestamp: '2026-06-01T10:00:00.000Z',
      path: '/doctors/1/reports',
    },
  })
  findByDoctor(
    @Param('id') id: number,
    @Query() query: FindReportsQueryDto,
    @CurrentUser() currentUser: UserPayload,
  ): Promise<PaginatedResponse<ReportResponseDto>> {
    return this.reportsService.findByDoctor(Number(id), query, currentUser);
  }
}
