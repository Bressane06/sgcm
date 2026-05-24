import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DoctorsService } from '../services/doctors.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FindDoctorsQueryDto } from '../dto/find-doctors-query.dto';
import { UpdateSpecialtyDto } from '../../specialties/dto/update-specialty.dto';
import { FindRelatedSchedulesQueryDto } from '../../schedules/dto/find-related-schedules-query.dto';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import type { UserPayload } from '../../auth/models/user-payload.model';
import { UserType } from '../enum/user-type.enum';
import { ApiAuthResponses } from '../../../common/swagger';

@ApiTags('Doctors')
@Controller('doctors')
@ApiAuthResponses({
  instance: '/doctors',
  unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
})
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Listar médicos' })
  async findAll(@Query() query: FindDoctorsQueryDto) {
    return await this.doctorsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Buscar médico por ID' })
  async findOne(@Param('id') id: number) {
    return await this.doctorsService.findOne(Number(id));
  }

  @Get(':id/specialties')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  @ApiOperation({ summary: 'Listar especialidades do médico' })
  async findSpecialties(@Query() query: FindDoctorsQueryDto, @Param('id') id: number) {
    return await this.doctorsService.findSpecialties(query, Number(id));
  }

  @Post(':id/specialties')
  @Roles(UserType.ADMIN)
  @ApiOperation({ summary: 'Associar especialidade ao médico' })
  async associateSpecialty(@Param('id') id: number, @Body() specialtyDto: UpdateSpecialtyDto) {
    return await this.doctorsService.associateSpecialty(
      Number(id),
      specialtyDto,
    );
  }

  @Delete(':id/specialties/:specialtyId')
  @Roles(UserType.ADMIN)
  @HttpCode(204)
  @ApiOperation({ summary: 'Remover especialidade do médico' })
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
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  @ApiOperation({ description: 'Listar agendamentos de um médico' })
  async findSchedules(
    @Param('id') id: number,
    @Query() query: FindRelatedSchedulesQueryDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.doctorsService.findSchedules(Number(id), query, user);
  }
}
