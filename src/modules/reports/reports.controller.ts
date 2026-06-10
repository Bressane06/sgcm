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
  ApiBody,
  ApiNotFoundResponse,
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
import { ProblemDetailsDto } from '../../common';

@ApiTags('Reports')
@Controller()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}
  @ApiBody({
    type: CreateReportDto,
  })
  @Post('appointments/:id/report')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID do exame',
  })
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
  @ApiOperation({ summary: 'Validar laudo por código' })
  @ApiParam({
    name: 'code',
    type: String,
    example: '9a1b6f8e-0c10-4c20-98f4-7b6a4c4fd1ef',
    description: 'Código de validação do laudo',
  })
  @ApiWrappedResponse({
    description: 'Laudo validado com sucesso.',
    model: ReportValidationDto,
    status: HttpStatus.OK,
  })
  @ApiBadRequestResponse({
    description: 'Código de validação em formato inválido.',
    content: {
      'application/json': {
        example: {
          type: 'https://sgcm.example.com/problems/bad-request',
          title: 'Requisição inválida',
          status: 400,
          detail: 'O código de validação fornecido não é um UUID válido.',
          instance: '/reports/validate/invalid-code',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Laudo não encontrado.',
    content: {
      'application/json': {
        example: {
          type: 'https://sgcm.example.com/problems/not-found',
          title: 'Recurso não encontrado',
          status: 404,
          detail: 'Não foi possível encontrar um laudo com o código informado.',
          instance: '/reports/validate/9a1b6f8e-0c10-4c20-98f4-7b6a4c4fd1ef',
        },
      },
    },
  })
  validate(@Param('code') code: string): Promise<ReportValidationDto> {
    return this.reportsService.validate(code);
  }

  @ApiBody({
    type: RevokeReportDto,
  })
  @Patch('reports/:id/revoke')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
    description: 'ID do laudo',
  })
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
  @ApiAuthResponses({
    instance: '/doctors/1/reports',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @ApiOperation({
    summary: 'Listar laudos emitidos por um médico com paginação',
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
