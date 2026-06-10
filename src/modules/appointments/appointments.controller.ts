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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentsService } from './appointments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { UserPayload } from '../auth/models/user-payload.model';
import { UserType } from '../users/enum/user-type.enum';
import { ApiAuthResponses } from '../../common/swagger';
import { ProceduresService } from '../procedures/procedures.service';
import { CreateProcedureDto } from '../procedures/dto/create-procedure.dto';

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
  @ApiOperation({ summary: 'Criar procedimento' })
  createProcedure(
    @Param('id') id: number,
    @Body() dto: CreateProcedureDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.proceduresService.create(+id, dto, user);
  }

  @Get(':id/procedures')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Listar procedimentos' })
  findAllProcedures(@Param('id') id: number, @CurrentUser() user: UserPayload) {
    return this.proceduresService.findByAppointment(Number(id), user);
  }
}
