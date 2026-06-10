import {
  Body,
  Controller,
  Delete,
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
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { FindSchedulesQueryDto } from './dto/find-schedules-query.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { UpdateScheduleStatusDto } from './dto/update-schedule-status.dto';
import { SchedulesService } from './services/schedules.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { UserPayload } from '../auth/models/user-payload.model';
import { UserType } from '../users/enum/user-type.enum';
import { ApiAuthResponses, ApiWrappedResponse } from '../../common/swagger';
import { ScheduleResponseDto } from './dto/schedule-response.dto';
import { CreateInPersonScheduleDto } from './dto/create-inperson-dto';
import { CreateOnlineScheduleDto } from './dto/create-online-dto';
import { CreateHomeScheduleDto } from './dto/create-home-dto';

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
  @ApiExtraModels(
    CreateInPersonScheduleDto,
    CreateOnlineScheduleDto,
    CreateHomeScheduleDto,
  )
  @ApiOperation({
    summary: 'Criar agendamento',
    description: 'Cria um agendamento presencial, online ou domiciliar.',
  })
  @ApiBody({
    description: 'O corpo varia conforme o tipo de agendamento informado.',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(CreateInPersonScheduleDto) },
        { $ref: getSchemaPath(CreateOnlineScheduleDto) },
        { $ref: getSchemaPath(CreateHomeScheduleDto) },
      ],
    },
  })
  @ApiWrappedResponse({
    description: 'Agendamento criado com sucesso.',
    model: ScheduleResponseDto,
    status: HttpStatus.CREATED,
  })
  create(@Body() dto: CreateScheduleDto, @CurrentUser() user: UserPayload) {
    return this.schedulesService.create(dto, user);
  }
  @Get()
  @ApiWrappedResponse({
    description: 'Agendamentos retornados com sucesso.',
    model: ScheduleResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Listar agendamentos' })
  findAll(@Query() query: FindSchedulesQueryDto) {
    return this.schedulesService.findAll(query);
  }

  @Get(':id')
  @ApiWrappedResponse({
    description: 'Agendamento encontrado.',
    model: ScheduleResponseDto,
    status: HttpStatus.OK,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador do agendamento',
  })
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  findOne(@Param('id') id: number, @CurrentUser() user: UserPayload) {
    return this.schedulesService.findOneWithAccess(Number(id), user);
  }

  @Put(':id')
  @ApiBody({
    type: UpdateScheduleDto,
  })
  @ApiWrappedResponse({
    description: 'Agendamento atualizado com sucesso.',
    model: ScheduleResponseDto,
    status: HttpStatus.OK,
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador do agendamento',
  })
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Atualizar agendamento' })
  update(@Param('id') id: number, @Body() dto: UpdateScheduleDto) {
    return this.schedulesService.update(Number(id), dto);
  }

  @ApiBody({
    type: UpdateScheduleStatusDto,
  })
  @ApiWrappedResponse({
    description: 'Status atualizado com sucesso.',
    model: ScheduleResponseDto,
    status: HttpStatus.OK,
  })
  @Patch(':id/status')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador do agendamento',
  })
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
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador do agendamento',
  })
  @ApiOperation({
    summary: 'Remover agendamento',
  })
  @Roles(UserType.ADMIN)
  @HttpCode(204)
  async remove(@Param('id') id: number) {
    await this.schedulesService.remove(Number(id));
  }
}
