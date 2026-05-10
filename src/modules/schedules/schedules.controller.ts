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

@ApiTags('Schedules')
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar agendamento' })
  create(@Body() dto: CreateScheduleDto) {
    return this.schedulesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar agendamentos' })
  findAll(@Query() query: FindSchedulesQueryDto) {
    return this.schedulesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  findOne(@Param('id') id: number) {
    return this.schedulesService.findOne(Number(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar agendamento' })
  update(@Param('id') id: number, @Body() dto: UpdateScheduleDto) {
    return this.schedulesService.update(Number(id), dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do agendamento' })
  updateStatus(
    @Param('id') id: number,
    @Body() dto: UpdateScheduleStatusDto,
  ) {
    return this.schedulesService.updateStatus(Number(id), dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover agendamento' })
  async remove(@Param('id') id: number) {
    await this.schedulesService.remove(Number(id));
  }
}