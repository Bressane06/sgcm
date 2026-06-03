import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Controller('')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Post('appointments/:appointmentId/records')
  create(@Body() createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.medicalRecordsService.create(createMedicalRecordDto);
  }

  @Get('appointments/:appointmentId/records')
  findAppointmentRecords(@Param('appointmentId') appointmentId: string) {
    return this.medicalRecordsService.findAppointmentRecords(+appointmentId);
  }

  @Put('records/:id')
  update(
    @Param('id') id: string,
    @Body() updateMedicalRecordDto: UpdateMedicalRecordDto,
  ) {
    return this.medicalRecordsService.update(+id, updateMedicalRecordDto);
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
