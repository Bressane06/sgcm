import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserPayload } from '../auth/models/user-payload.model';
import { Roles } from '../../common';
import { UserType } from '../users/enum/user-type.enum';
import { ApiAuthResponses, ApiWrappedResponse } from '../../common/swagger';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { MedicalRecordResponseDto } from './dto/medical-record-response.dto';

@ApiTags('Medical Records')
@Controller('')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @ApiOperation({
    summary: 'Criar prontuário médico',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador do atendimento',
  })
  @ApiBody({
    type: CreateMedicalRecordDto,
  })
  @ApiWrappedResponse({
    description: 'Prontuário criado com sucesso.',
    model: MedicalRecordResponseDto,
    status: HttpStatus.CREATED,
  })
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

  @ApiOperation({
    summary: 'Listar prontuários de um atendimento',
  })
  @ApiAuthResponses({
    instance: 'appointments/:id/records',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador do atendimento',
  })
  @ApiWrappedResponse({
    description: 'Prontuários do atendimento retornados com sucesso.',
    model: MedicalRecordResponseDto,
    isArray: true,
    status: HttpStatus.OK,
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

  @ApiOperation({
    summary: 'Atualizar prontuário',
  })
  @ApiAuthResponses({
    instance: 'records/:id',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador do prontuário',
  })
  @ApiBody({
    type: UpdateMedicalRecordDto,
  })
  @ApiWrappedResponse({
    description: 'Prontuário atualizado com sucesso.',
    model: MedicalRecordResponseDto,
    status: HttpStatus.OK,
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

  @ApiOperation({
    summary: 'Remover prontuário',
  })
  @ApiAuthResponses({
    instance: 'records/:id',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador do prontuário',
  })
  @Delete('records/:id')
  @Roles(UserType.ADMIN, UserType.DOCTOR)
  delete(@Param('id') id: string) {
    return this.medicalRecordsService.delete();
  }

  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador do paciente',
  })
  @ApiOperation({
    summary: 'Listar prontuários de um paciente',
  })
  @ApiAuthResponses({
    instance: 'patients/:id/records',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @ApiWrappedResponse({
    description: 'Prontuários do paciente retornados com sucesso.',
    model: MedicalRecordResponseDto,
    isArray: true,
    status: HttpStatus.OK,
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

  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Identificador do médico',
  })
  @ApiOperation({
    summary: 'Listar prontuários de um médico',
  })
  @ApiAuthResponses({
    instance: 'doctors/:id/records',
    unauthorizedDetail: 'Token JWT ausente, inválido ou expirado.',
  })
  @ApiWrappedResponse({
    description: 'Prontuários do médico retornados com sucesso.',
    model: MedicalRecordResponseDto,
    isArray: true,
    status: HttpStatus.OK,
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
