import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DoctorsService } from './services/doctors.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FindDoctorsQueryDto } from './dto/find-doctors-query.dto';
import { UpdateSpecialtyDto } from '../specialties/dto/update-specialty.dto';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @ApiOperation({ description: 'Listar médicos com paginação, filtro por especialidade e nome.' })
  async findAll(@Query() query: FindDoctorsQueryDto) {
    return await this.doctorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ description: 'Buscar médico por ID com especialidades incluídas na resposta.' })
  async findOne(@Param('id') id: number) {
    return await this.doctorsService.findOne(Number(id));
  }

  @Get(':id/specialties')
  @ApiOperation({ description: 'Listar especialidades de um médico' })
  async findSpecialties(@Query() query: FindDoctorsQueryDto, @Param('id') id: number) {
    return await this.doctorsService.findSpecialties(query, Number(id));
  }

  @Post(':id/specialties')
  @ApiOperation({ description: 'Associar especialidade a um médico.' })
  async associateSpecialty(@Param('id') id: number, @Body() specialtyDto: UpdateSpecialtyDto) {
    return await this.doctorsService.associateSpecialty(
      Number(id),
      specialtyDto,
    );
  }

  @Delete(':id/specialties/:specialtyId')
  @ApiOperation({ description: 'Desassociar especialidade de um médico' })
  async removeSpecialty(  
    @Param('id') id: number,
    @Param('specialtyId') specialtyId: number,
  ) {
    return await this.doctorsService.dessociateSpecialty(
      Number(id),
      Number(specialtyId),
    );
  }

  @Get(':id/schedules')
  @ApiOperation({ description: 'Listar agendamentos de um médico com filtros e paginação.' })
  async findSchedules(@Query() query: FindDoctorsQueryDto, @Param('id') id: number) {
    return await this.doctorsService.findSchedules(Number(id));
  }
}
