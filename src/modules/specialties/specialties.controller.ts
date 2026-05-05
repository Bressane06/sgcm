import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindSpecialtiesQueryDto } from './dto/find-specialties-query.dto';
import { FindDoctorsQueryDto } from '../users/dto/find-doctors-query.dto';

@ApiTags('Specialties')
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova especialidade.' })
  async create(@Body() createSpecialtyDto: CreateSpecialtyDto) {
    return await this.specialtiesService.create(createSpecialtyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retorna todas as especialidades.' })
  async findAll(@Query() query: FindSpecialtiesQueryDto) {
    return await this.specialtiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna uma especialidade específica.' })
  async findOne(@Param('id') id: string) {
    return await this.specialtiesService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma especialidade específica.' })
  async update(
    @Param('id') id: string,
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
  ) {
    return await this.specialtiesService.update(+id, updateSpecialtyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma especialidade específica.' })
  async remove(@Param('id') id: string) {
    return await this.specialtiesService.remove(+id);
  }

  @Get(':id/doctors')
  @ApiOperation({ summary: 'Retorna os médicos da especialidade.' })
  async findDoctors(@Query() query: FindDoctorsQueryDto, @Param('id') id: string) {
    return await this.specialtiesService.findDoctors(query, +id);
  }
}
