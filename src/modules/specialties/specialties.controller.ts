import {
  Controller,
  Get,
  HttpCode,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserType } from '../users/enum/user-type.enum';
import { FindSpecialtiesQueryDto } from './dto/find-specialties-query.dto';
import { FindDoctorsQueryDto } from '../users/dto/find-doctors-query.dto';
import { ApiAuthResponses, ApiWrappedResponse } from '../../common/swagger';
import { SpecialtyResponseDto } from './dto/specialty-response-dto';
import { DoctorResponseDto } from '../users/dto/doctor-response.dto';

@ApiTags('Specialties')
@Controller('specialties')
@ApiAuthResponses({
  instance: '/specialties',
  unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
})
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Post()
  @ApiBody({
    type: CreateSpecialtyDto,
  })
  @ApiWrappedResponse({
    description: 'Especialidade criada com sucesso.',
    model: SpecialtyResponseDto,
    status: HttpStatus.CREATED,
  })
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Cria uma nova especialidade.' })
  async create(@Body() createSpecialtyDto: CreateSpecialtyDto) {
    return await this.specialtiesService.create(createSpecialtyDto);
  }

  @Get()
  @ApiWrappedResponse({
    description: 'Especialidades retornadas com sucesso.',
    model: SpecialtyResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Retorna todas as especialidades.' })
  async findAll(@Query() query: FindSpecialtiesQueryDto) {
    return await this.specialtiesService.findAll(query);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador da especialidade',
  })
  @ApiWrappedResponse({
    description: 'Especialidade encontrada.',
    model: SpecialtyResponseDto,
    status: HttpStatus.OK,
  })
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Retorna uma especialidade específica.' })
  async findOne(@Param('id') id: string) {
    return await this.specialtiesService.findOne(+id);
  }

  @Put(':id')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador da especialidade',
  })
  @ApiBody({
    type: UpdateSpecialtyDto,
  })
  @ApiWrappedResponse({
    description: 'Especialidade atualizada com sucesso.',
    model: SpecialtyResponseDto,
    status: HttpStatus.OK,
  })
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Atualiza uma especialidade específica.' })
  async update(
    @Param('id') id: string,
    @Body() updateSpecialtyDto: UpdateSpecialtyDto,
  ) {
    return await this.specialtiesService.update(+id, updateSpecialtyDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador da especialidade',
  })
  @ApiNoContentResponse({
    description: 'Especialidade removida com sucesso.',
  })
  @Roles(UserType.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove uma especialidade específica.' })
  async remove(@Param('id') id: string) {
    return await this.specialtiesService.remove(+id);
  }

  @Get(':id/doctors')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador da especialidade',
  })
  @ApiWrappedResponse({
    description: 'Médicos da especialidade retornados com sucesso.',
    model: DoctorResponseDto,
    isArray: true,
    status: HttpStatus.OK,
  })
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Retorna os médicos da especialidade.' })
  async findDoctors(
    @Query() query: FindDoctorsQueryDto,
    @Param('id') id: string,
  ) {
    return await this.specialtiesService.findDoctors(query, +id);
  }
}
