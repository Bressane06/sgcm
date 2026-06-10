import { Controller, Get, Param, Query } from '@nestjs/common';
import { PatientsService } from '../services/patients.service';
import { FindPatientsQueryDto } from '../dto/find-patients-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { FindRelatedSchedulesQueryDto } from '../../schedules/dto/find-related-schedules-query.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import type { UserPayload } from '../../auth/models/user-payload.model';
import { UserType } from '../enum/user-type.enum';
import { ApiAuthResponses, ApiWrappedResponse } from '../../../common/swagger';
import { FindAppointmentsQueryDto } from '../../appointments/dto/find-appointments-query.dto';
import { ProblemDetailsDto } from '../../../common';
import { ScheduleResponseDto } from '../../schedules/dto/schedule-response.dto';
import { PatientResponseDto } from '../dto/patient-response.dto';

@ApiTags('Patients')
@Controller('patients')
@ApiAuthResponses({
  instance: '/patients',
  unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
})
@ApiExtraModels(PatientResponseDto, ProblemDetailsDto)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Listar pacientes' })
  @ApiWrappedResponse({
    description: 'Lista de pacientes retornada com sucesso.',
    model: PatientResponseDto,
    isArray: true,
  })
  findAll(@Query() query: FindPatientsQueryDto) {
    return this.patientsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.PATIENT)
  @ApiOperation({ summary: 'Buscar paciente por ID' })
  @ApiWrappedResponse({
    description: 'Paciente encontrado com sucesso.',
    model: PatientResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Paciente não encontrado.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath(ProblemDetailsDto) },
        example: {
          type: 'https://sgcm.example.com/problems/not-found',
          title: 'Recurso não encontrado',
          status: 404,
          detail: 'Não foi possível localizar o paciente com o ID informado.',
          instance: '/patients/1',
          method: 'GET',
          timestamp: '2026-06-09T15:50:00.000Z',
          traceId: 'p1a2t3i4-e5n6-t7h8-i9j0-k1l2m3n4o5p6',
        },
      },
    },
  })
  findOne(@Param('id') id: number, @CurrentUser() user: UserPayload) {
    return this.patientsService.findOneWithAccess(Number(id), user);
  }
  @Get(':id/schedules')
  @Roles(UserType.ADMIN, UserType.PATIENT)
  @ApiOperation({ summary: 'Listar agendamentos de um paciente' })
  @ApiWrappedResponse({
    description: 'Agendamentos do paciente retornados com sucesso.',
    model: ScheduleResponseDto,
    isArray: true,
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado aos agendamentos de outro paciente.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath(ProblemDetailsDto) },
        example: {
          type: 'https://sgcm.example.com/problems/forbidden',
          title: 'Acesso negado',
          status: 403,
          detail:
            'Você não tem permissão para visualizar agendamentos de outro usuário.',
          instance: '/patients/2/schedules',
          method: 'GET',
          timestamp: '2026-06-09T15:55:00.000Z',
          traceId: 'f0r0b0i0-d0d0-e0n0-s000-k1l2m3n4o5p6',
        },
      },
    },
  })
  findSchedules(
    @Param('id') id: number,
    @Query() query: FindRelatedSchedulesQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.patientsService.findSchedules(Number(id), query, user);
  }

  @Get(':id/appointments')
  @Roles(UserType.ADMIN, UserType.PATIENT)
  @ApiOperation({ summary: 'Listar atendimentos de um paciente' })
  @ApiWrappedResponse({
    description: 'Atendimentos do paciente retornados com sucesso.',
    // model: AppointmentResponseDto, // Se você tiver um DTO de resposta de atendimento
    isArray: true,
  })
  findAppointments(
    @Param('id') id: number,
    @Query() query: FindAppointmentsQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.patientsService.findAppointments(Number(id), query, user);
  }
}
