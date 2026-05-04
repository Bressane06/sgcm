import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Specialties')
@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova especialidade.' })
  create(@Body() createSpecialtyDto: CreateSpecialtyDto) {
    return this.specialtiesService.create(createSpecialtyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retorna todas as especialidades.' })
  findAll() {
    return this.specialtiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna uma especialidade específica.' })
  findOne(@Param('id') id: string) {
    return this.specialtiesService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma especialidade específica.' })
  update(
    @Param('id') id: string,
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
  ) {
    return this.specialtiesService.update(+id, updateSpecialtyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma especialidade específica.' })
  remove(@Param('id') id: string) {
    return this.specialtiesService.remove(+id);
  }

  @Get(':id/doctors')
  @ApiOperation({ summary: 'Retorna os médicos da especialidade.' })
  findDoctors(@Param('id') id: string) {
    return this.specialtiesService.findDoctors(+id);
  }
}
