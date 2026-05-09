import { Controller, Get, Param, Query } from '@nestjs/common';
import { PatientsService } from '../services/patients.service';
import { FindPatientsQueryDto } from '../dto/find-patients-query.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pacientes' })
  findAll(@Query() query: FindPatientsQueryDto) {
    return this.patientsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar paciente por ID' })
  findOne(@Param('id') id: number) {
    return this.patientsService.findOne(Number(id));
  }
}
