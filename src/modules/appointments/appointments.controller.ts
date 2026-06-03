import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { FindAppointmentsQueryDto } from './dto/find-appointments-query.dto';
import { AppointmentsService } from './appointments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { UserPayload } from '../auth/models/user-payload.model';
import { UserType } from '../users/enum/user-type.enum';
import { ApiAuthResponses } from '../../common/swagger';

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
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @Get()
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Listar atendimentos' })
  findAll(
    @Query() query: FindAppointmentsQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.appointmentsService.findAll(query, user);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Buscar atendimento por ID' })
  findOne(@Param('id') id: number, @CurrentUser() user: UserPayload) {
    return this.appointmentsService.findOneWithAccess(Number(id), user);
  }
}
