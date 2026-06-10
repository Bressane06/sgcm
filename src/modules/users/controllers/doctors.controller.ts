import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { DoctorsService } from '../services/doctors.service';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  getSchemaPath,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { FindDoctorsQueryDto } from '../dto/find-doctors-query.dto';
import { UpdateSpecialtyDto } from '../../specialties/dto/update-specialty.dto';
import { FindRelatedSchedulesQueryDto } from '../../schedules/dto/find-related-schedules-query.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import type { UserPayload } from '../../auth/models/user-payload.model';
import { UserType } from '../enum/user-type.enum';
import { ApiAuthResponses, ApiWrappedResponse } from '../../../common/swagger';
import { FindAppointmentsQueryDto } from '../../appointments/dto/find-appointments-query.dto';
import { DoctorResponseDto } from '../dto/doctor-response.dto';
import { ProblemDetailsDto } from '../../../common/dto/problem-details.dto';
import { ScheduleResponseDto } from '../../schedules/dto/schedule-response.dto';
import { SpecialtyResponseDto } from '../../specialties/dto/specialty-response-dto';

@ApiTags('Doctors')
@Controller('doctors')
@ApiAuthResponses({
  instance: '/doctors',
  unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
})
@ApiExtraModels(
  DoctorResponseDto,
  ProblemDetailsDto,
  SpecialtyResponseDto,
  ScheduleResponseDto,
)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Listar médicos' })
  @ApiWrappedResponse({
    description: 'Lista de médicos retornada com sucesso.',
    model: DoctorResponseDto,
    isArray: true,
  })
  async findAll(@Query() query: FindDoctorsQueryDto) {
    return await this.doctorsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Buscar médico por ID' })
  @ApiWrappedResponse({
    description: 'Médico encontrado com sucesso.',
    model: DoctorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Médico não encontrado.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath(ProblemDetailsDto) },
        example: {
          type: 'https://sgcm.example.com/problems/not-found',
          title: 'Recurso não encontrado',
          status: 404,
          detail: 'Médico com ID informado não existe.',
          instance: '/doctors/1',
          method: 'GET',
          timestamp: '2026-06-09T16:10:00Z',
          traceId: 'd0c1-t0r2',
        },
      },
    },
  })
  async findOne(@Param('id') id: number) {
    return await this.doctorsService.findOne(Number(id));
  }

  @Get(':id/specialties')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Listar especialidades do médico' })
  @ApiWrappedResponse({
    description: 'Especialidades retornadas com sucesso.',
    model: SpecialtyResponseDto,
    isArray: true,
  })
  async findSpecialties(
    @Query() query: FindDoctorsQueryDto,
    @Param('id') id: number,
  ) {
    return await this.doctorsService.findSpecialties(query, Number(id));
  }

  @Post(':id/specialties')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Associar especialidade ao médico' })
  @ApiBody({ type: UpdateSpecialtyDto })
  @ApiWrappedResponse({
    description: 'Especialidade associada com sucesso.',
    status: HttpStatus.CREATED,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos ou especialidade inexistente.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath(ProblemDetailsDto) },
        example: {
          type: 'https://sgcm.example.com/problems/validation-error',
          title: 'Erro de associação',
          status: 400,
          detail: 'A especialidade informada não é válida para este sistema.',
          instance: '/doctors/1/specialties',
          method: 'POST',
          timestamp: '2026-06-09T16:15:00Z',
          traceId: 'a1s2-s3o4',
        },
      },
    },
  })
  async associateSpecialty(
    @Param('id') id: number,
    @Body() specialtyDto: UpdateSpecialtyDto,
  ) {
    return await this.doctorsService.associateSpecialty(
      Number(id),
      specialtyDto,
    );
  }

  @Delete(':id/specialties/:specialtyId')
  @Roles(UserType.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover especialidade do médico' })
  @ApiNoContentResponse({ description: 'Associação removida com sucesso.' })
  async removeSpecialty(
    @Param('id') id: number,
    @Param('specialtyId') specialtyId: number,
  ) {
    return await this.doctorsService.dessociateSpecialty(
      Number(id),
      Number(specialtyId),
    );
  }

  @Get(':id/schedules')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: 'Listar agendamentos de um médico' })
  @ApiWrappedResponse({
    description: 'Agendamentos retornados com sucesso.',
    model: ScheduleResponseDto,
    isArray: true,
  })
  @ApiForbiddenResponse({
    description: 'Acesso negado aos agendamentos de outro médico.',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath(ProblemDetailsDto) },
        example: {
          type: 'https://sgcm.example.com/problems/forbidden',
          title: 'Acesso negado',
          status: 403,
          detail: 'Médicos só podem visualizar seus próprios agendamentos.',
          instance: '/doctors/5/schedules',
          method: 'GET',
          timestamp: '2026-06-09T16:20:00Z',
          traceId: 'f0r0-b0i0',
        },
      },
    },
  })
  async findSchedules(
    @Param('id') id: number,
    @Query() query: FindRelatedSchedulesQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.doctorsService.findSchedules(Number(id), query, user);
  }

  @Get(':id/appointments')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: 'Listar atendimentos de um médico' })
  @ApiWrappedResponse({
    description: 'Atendimentos retornados com sucesso.',
    isArray: true,
  })
  findAppointments(
    @Param('id') id: number,
    @Query() query: FindAppointmentsQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.doctorsService.findAppointments(Number(id), query, user);
  }
}
