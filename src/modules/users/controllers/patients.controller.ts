import { Controller, Get, Param, Query } from '@nestjs/common';
import { PatientsService } from '../services/patients.service';
import { FindPatientsQueryDto } from '../dto/find-patients-query.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FindRelatedSchedulesQueryDto } from '../../schedules/dto/find-related-schedules-query.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import type { UserPayload } from '../../auth/models/user-payload.model';
import { UserType } from '../enum/user-type.enum';
import { ApiAuthResponses } from '../../../common/swagger';
import { FindAppointmentsQueryDto } from '../../appointments/dto/find-appointments-query.dto';

@ApiTags('Patients')
@Controller('patients')
@ApiAuthResponses({
  instance: '/patients',
  unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
})
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Listar pacientes' })
  findAll(@Query() query: FindPatientsQueryDto) {
    return this.patientsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.PATIENT)
  @ApiOperation({ summary: 'Buscar paciente por ID' })
  findOne(@Param('id') id: number, @CurrentUser() user: UserPayload) {
    return this.patientsService.findOneWithAccess(Number(id), user);
  }

  @Get(':id/schedules')
  @Roles(UserType.ADMIN, UserType.PATIENT)
  @ApiOperation({ summary: 'Listar agendamentos de um paciente' })
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
  findAppointments(
    @Param('id') id: number,
    @Query() query: FindAppointmentsQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.patientsService.findAppointments(Number(id), query, user);
  }
}
