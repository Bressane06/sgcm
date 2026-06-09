import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../auth/models/user-payload.model';
import { Roles } from '../../common';
import { UserType } from '../users/enum/user-type.enum';
import { ApiAuthResponses } from '../../common/swagger';
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiParam,
  getSchemaPath,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
@Controller('')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @ApiAuthResponses({
    instance: 'appointments/:id/records',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @Post('appointments/:id/records')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  create(
    @Param('id') id: string,
    @Body() createMedicalRecordDto: CreateMedicalRecordDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.medicalRecordsService.create(+id, createMedicalRecordDto, user);
  }

  @ApiAuthResponses({
    instance: 'appointments/:id/records',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @Get('appointments/:id/records')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  findAppointmentRecords(
    @Param('id') appointmentId: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.medicalRecordsService.findAppointmentRecords(
      +appointmentId,
      user,
    );
  }

  @ApiAuthResponses({
    instance: 'records/:id',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador do prontuário',
  })
  @Put('records/:id')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  update(
    @Param('id') id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.medicalRecordsService.update(+id, updateMedicalRecordDto, user);
  }

  @Delete('records/:id')
  @ApiExcludeEndpoint()
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  delete() {
    return this.medicalRecordsService.delete();
  }

  @ApiAuthResponses({
    instance: 'patients/:id/records',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @Get('patients/:id/records')
  @Roles(UserType.ADMIN, UserType.DOCTOR, UserType.PATIENT)
  findPatientRecords(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.medicalRecordsService.findPatientRecords(+id, user, pagination);
  }

  @ApiAuthResponses({
    instance: 'doctors/:id/records',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @Get('doctors/:id/records')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  findDoctorRecords(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.medicalRecordsService.findDoctorRecords(+id, user, pagination);
  }
}
