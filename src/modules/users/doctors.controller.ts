import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { DoctorsService } from './services/doctors.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FindDoctorsQueryDto } from './dto/find-doctors-query.dto';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar médicos' })
  findAll(@Query() query: FindDoctorsQueryDto) {
    return this.doctorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar médico por ID' })
  findOne(@Param('id') id: number) {
    return this.doctorsService.findOne(Number(id));
  }

  // Vai ser implementado no módulo de agendamento,
  //  pois envolve regras de negócio específicas
  // @Get(':id/specialities')
  // @ApiOperation({ summary: 'Listar especialidades de um médico' })
  // findSpecialities(@Param('id') id: number) {
  //   return this.doctorsService.findSpecialities(Number(id));
  // }

  // Vai ser implementado no módulo de agendamento,
  // @Post(':id/specialities')
  // @ApiOperation({ summary: 'Criar um nova especialidade para um médico' })
  // createSpeciality(@Param('id') id: number, @Body() createSpecialityDto: any) {
  //   return this.doctorsService.createSpeciality(Number(id), createSpecialityDto);
  // }

  // Vai ser implementado no módulo de agendamento,
  // @Delete(':id/specialities/:specialityId')
  // @ApiOperation({ summary: 'Remover uma especialidade de um médico' })
  // removeSpeciality(
  //   @Param('id') id: number,
  //   @Param('specialityId') specialityId: number,
  // ) {
  //   return this.doctorsService.removeSpeciality(Number(id), Number(specialityId));
  // }

  // Vai ser implementado no módulo de agendamento,
  // @Get(':id/schedules')
  // @ApiOperation({ summary: 'Listar horários disponíveis de um médico' })
  // findSchedules(@Param('id') id: number) {
  //   return this.doctorsService.findSchedules(Number(id));
  // }
}
