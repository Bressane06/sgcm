import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../auth/models/user-payload.model';
import { Roles } from '../../common';
import { UserType } from '../users/enum/user-type.enum';
import { ApiAuthResponses } from '../../common/swagger';
import { ApiExcludeEndpoint, ApiParam } from '@nestjs/swagger';

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

  @Get('appointments/:id/records')
  findAppointmentRecords(@Param('appointmentId') appointmentId: string) {
    return this.medicalRecordsService.findAppointmentRecords(+appointmentId);
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
  update(
    @Param('id') id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
    @CurrentUser() user: UserPayload,
  ) {
    return this.medicalRecordsService.update(+id, updateMedicalRecordDto, user);
  }

  @Delete('records/:id')
  @ApiExcludeEndpoint()
  delete() {
    return this.medicalRecordsService.delete();
  }

  @Get('patient/:id/records')
  findPatientRecords(@Param('id') id: string) {
    return this.medicalRecordsService.findPatientRecords(+id);
  }

  @Get('doctors/:id/records')
  findDoctorRecords(@Param('id') id: string) {
    return this.medicalRecordsService.findDoctorRecords(+id);
  }
}
