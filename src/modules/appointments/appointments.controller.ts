import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiExtraModels, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
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

@ApiExtraModels(CreateConsultationDto, CreateExamDto, CreateFollowUpDto)
@ApiTags('Appointments')
@Controller('appointments')
@ApiAuthResponses({
  instance: '/appointments',
  unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
})
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

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
}
