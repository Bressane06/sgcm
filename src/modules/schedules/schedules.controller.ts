import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { FindSchedulesQueryDto } from './dto/find-schedules-query.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { UpdateScheduleStatusDto } from './dto/update-schedule-status.dto';
import { SchedulesService } from './services/schedules.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { UserPayload } from '../auth/models/user-payload.model';
import { UserType } from '../users/enum/user-type.enum';
import { ApiAuthResponses } from '../../common/swagger';

@ApiTags('Schedules')
@Controller('schedules')
@ApiAuthResponses({
  instance: '/schedules',
  unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
})
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @Roles(UserType.ADMIN, UserType.PATIENT)
  @ApiOperation({ summary: 'Criar agendamento' })
  create(
    @Body() dto: CreateScheduleDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.schedulesService.create(dto, user);
  }

  @Get()
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Listar agendamentos' })
  findAll(@Query() query: FindSchedulesQueryDto) {
    return this.schedulesService.findAll(query);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  findOne(
    @Param('id') id: number,
    @CurrentUser() user: UserPayload,
  ) {
    return this.schedulesService.findOneWithAccess(Number(id), user);
  }

  @Put(':id')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Atualizar agendamento' })
  update(@Param('id') id: number, @Body() dto: UpdateScheduleDto) {
    return this.schedulesService.update(Number(id), dto);
  }

  @Patch(':id/status')
  @Roles(UserType.ADMIN, UserType.PATIENT)
  @ApiOperation({ summary: 'Atualizar status do agendamento' })
  updateStatus(
    @Param('id') id: number,
    @Body() dto: UpdateScheduleStatusDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.schedulesService.updateStatus(Number(id), dto, user);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover agendamento' })
  async remove(@Param('id') id: number) {
    await this.schedulesService.remove(Number(id));
  }
}