import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentsService } from './appointments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { UserPayload } from '../auth/models/user-payload.model';
import { UserType } from '../users/enum/user-type.enum';
import { ApiAuthResponses } from '../../common/swagger';
import { CreateConsultationDto } from './dto/create-consultation-doc.dto';
import { CreateExamDto } from './dto/create-exam-doc.dto';
import { CreateFollowUpDto } from './dto/create-follow-up-doc.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { ProceduresService } from '../procedures/procedures.service';
import { CreateProcedureDto } from '../procedures/dto/create-procedure.dto';
import { CreateSimpleProcedureDto } from '../procedures/dto/create-simple-procedure.dto';
import { CreateSpecializedProcedureDto } from '../procedures/dto/create-specialized-procedure.dto';
import { ProcedureResponseDto } from '../procedures/dto/procedure-response.dto';

@ApiExtraModels(CreateSimpleProcedureDto, CreateSpecializedProcedureDto)
@ApiExtraModels(CreateConsultationDto, CreateExamDto, CreateFollowUpDto)
@ApiTags('Appointments')
@Controller('appointments')
@ApiAuthResponses({
  instance: '/appointments',
  unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
})
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly proceduresService: ProceduresService,
  ) {}

  @Post()
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: 'Criar atendimento para agendamento confirmado' })
  @ApiBody({
    description: 'O corpo varia conforme o tipo do atendimento informado.',
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(CreateConsultationDto),
        },
        {
          $ref: getSchemaPath(CreateExamDto),
        },
        {
          $ref: getSchemaPath(CreateFollowUpDto),
        },
      ],
    },
  })
  @ApiCreatedResponse({
    description: 'Atendimento criado com sucesso.',
    type: AppointmentResponseDto,
  })
  create(@Body() dto: CreateAppointmentDto, @CurrentUser() user: UserPayload) {
    return this.appointmentsService.create(dto, user);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Listar atendimentos' })
  findAll(@Query() query: FindAppointmentsQueryDto) {
    return this.appointmentsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Buscar atendimento por ID' })
  findOne(@Param('id') id: number, @CurrentUser() user: UserPayload) {
    return this.appointmentsService.findOneWithAccess(Number(id), user);
  }

  @Put(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: 'Atualizar atendimento' })
  update(
    @Param('id') id: number,
    @Body() dto: UpdateAppointmentDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.appointmentsService.update(Number(id), dto, user);
  }

  @Patch(':id/finish')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ summary: 'Finalizar atendimento' })
  finish(@Param('id') id: number, @CurrentUser() user: UserPayload) {
    return this.appointmentsService.finish(Number(id), user);
  }

  @Post(':id/procedures')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Adicionar procedimento a atendimento',
    description:
      'Adiciona um procedimento a um atendimento `IN_PROGRESS`. O tipo determina os campos aceitos.',
  })
  @ApiParam({ name: 'id', description: 'ID do atendimento', example: 1 })
  @ApiBody({
    description: 'Campos variam conforme o `type` informado.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(CreateSimpleProcedureDto) },
        { $ref: getSchemaPath(CreateSpecializedProcedureDto) },
      ],
    },
    examples: {
      simple: {
        summary: 'Procedimento simples',
        value: {
          name: 'Curativo simples',
          description: 'Limpeza e curativo em ferida superficial',
          type: 'SIMPLE',
          estimatedDuration: 15,
        },
      },
      specialized: {
        summary: 'Procedimento especializado',
        value: {
          name: 'Ressonância magnética',
          description: 'Ressonância de coluna lombar com contraste',
          type: 'SPECIALIZED',
          requiredEquipment: 'Equipamento de RM 3T',
          complexityLevel: 'HIGH',
          requiresAuthorization: true,
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Procedimento criado com sucesso.',
    type: ProcedureResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Atendimento não está IN_PROGRESS ou campos inválidos para o tipo.',
  })
  @ApiResponse({ status: 404, description: 'Atendimento não encontrado.' })
  createProcedure(
    @Param('id') id: number,
    @Body() dto: CreateProcedureDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.proceduresService.create(+id, dto, user);
  }

  @Get(':id/procedures')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({
    summary: 'Listar procedimentos do atendimento',
    description:
      'Doctor e Patient só acessam procedimentos de atendimentos próprios.',
  })
  @ApiParam({ name: 'id', description: 'ID do atendimento', example: 1 })
  @ApiOkResponse({
    description: 'Lista de procedimentos.',
    type: [ProcedureResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Atendimento não encontrado.' })
  findAllProcedures(@Param('id') id: number, @CurrentUser() user: UserPayload) {
    return this.proceduresService.findByAppointment(Number(id), user);
  }
}
