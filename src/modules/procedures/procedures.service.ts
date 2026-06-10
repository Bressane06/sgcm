import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { UserPayload } from '../auth/models/user-payload.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Procedure } from './entities/procedure.entity';
import { Repository } from 'typeorm';
import { ProcedureResponseDto } from './dto/procedure-response.dto';
import { SimpleProcedure } from './entities/simple-procedure.entity';
import { SpecializedProcedure } from './entities/specialized-procedure.entity';
import { ProcedureType } from './enum/procedure-type.enum';
import { AuthorizationStatus } from './enum/authorization-status.enum';
import { NotFoundException } from '../../common';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentStatus } from '../appointments/enum/appointment-status.enum';

@Injectable()
export class ProceduresService {
  constructor(
    @InjectRepository(Procedure)
    private readonly procedureRepository: Repository<Procedure>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  private assertAllowedFieldsForType(dto: CreateProcedureDto): void {
    const invalidFields: string[] = [];

    if (dto.type === ProcedureType.SIMPLE) {
      if (dto.requiredEquipment) invalidFields.push('requiredEquipment');
      if (dto.complexityLevel) invalidFields.push('complexityLevel');
      if (dto.requiresAuthorization !== undefined) {
        invalidFields.push('requiresAuthorization');
      }
    }

    if (dto.type === ProcedureType.SPECIALIZED) {
      if (dto.estimatedDuration !== undefined) {
        invalidFields.push('estimatedDuration');
      }
    }

    if (invalidFields.length > 0) {
      throw new BadRequestException(
        `Campos inválidos para procedimento ${dto.type}: ${invalidFields.join(', ')}.`,
      );
    }
  }

  private async findAppointmentOrFail(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOneBy({ id });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  private async findEntityOrFail(id: number): Promise<Procedure> {
    const procedure = await this.procedureRepository.findOneBy({ id });
    if (!procedure) {
      throw new NotFoundException(`Procedure with ID ${id} not found`);
    }

    return procedure;
  }

  private toResponse(procedure: Procedure): ProcedureResponseDto {
    const response: ProcedureResponseDto = {
      id: procedure.id,
      name: procedure.name,
      description: procedure.description,
      type: procedure.type,
      createdAt: procedure.createdAt,
      updatedAt: procedure.updatedAt,
    };

    if (procedure instanceof SimpleProcedure) {
      response.estimatedDuration = procedure.estimatedDuration;
    }

    if (procedure instanceof SpecializedProcedure) {
      response.requiredEquipment = procedure.requiredEquipment;
      response.complexityLevel = procedure.complexityLevel;
      response.requiresAuthorization = procedure.requiresAuthorization;
      response.authorizationStatus = procedure.authorizationStatus;
      response.authorizedAt = procedure.authorizedAt;
      response.deniedAt = procedure.deniedAt;
    }
    return response;
  }

  async create(
    id: number,
    dto: CreateProcedureDto,
    user: UserPayload,
  ): Promise<ProcedureResponseDto> {
    this.assertAllowedFieldsForType(dto);
    const appointment = await this.findAppointmentOrFail(id);

    if (appointment.status !== AppointmentStatus.IN_PROGRESS) {
      throw new NotFoundException('Atendimento');
    }

    const baseData = {
      name: dto.name,
      description: dto.description,
      appointment,
      appointmentId: appointment.id,
    };

    switch (dto.type) {
      case ProcedureType.SIMPLE: {
        const procedure = new SimpleProcedure();

        Object.assign(procedure, baseData);
        procedure.estimatedDuration = dto.estimatedDuration;

        const saved = await this.procedureRepository.save(procedure);
        return this.toResponse(saved);
      }

      case ProcedureType.SPECIALIZED: {
        const procedure = new SpecializedProcedure();

        Object.assign(procedure, baseData);
        procedure.requiredEquipment = dto.requiredEquipment;
        procedure.complexityLevel = dto.complexityLevel;
        procedure.requiresAuthorization = dto.requiresAuthorization ?? true;
        procedure.authorizationStatus = AuthorizationStatus.PENDING;

        const saved = await this.procedureRepository.save(procedure);
        return this.toResponse(saved);
      }
    }
  }

  async findAll(currentUser: UserPayload): Promise<ProcedureResponseDto[]> {
    const procedures = await this.procedureRepository.find();
    return procedures.map((procedure) => this.toResponse(procedure));
  }

  async findOne(
    id: number,
    currentUser: UserPayload,
  ): Promise<ProcedureResponseDto> {
    const procedure = await this.findEntityOrFail(id);
    return this.toResponse(procedure);
  }

  async update(
    id: number,
    updateProcedureDto: UpdateProcedureDto,
    currentUser: UserPayload,
  ): Promise<ProcedureResponseDto> {
    // Buscar procedimento por ID com todos os atributos do subtipo.
    const procedure = await this.findEntityOrFail(id);
    return this.toResponse(procedure);
  }

  async authorizeProcedure(id: number): Promise<ProcedureResponseDto> {
    const procedure = await this.findEntityOrFail(id);
    if (!(procedure instanceof SpecializedProcedure)) {
      throw new NotFoundException(
        'Only specialized procedures can be authorized',
      );
    }

    if (!procedure.isPending()) {
      throw new NotFoundException(
        'This procedure does not require authorization',
      );
    }

    if (procedure.authorizationStatus === AuthorizationStatus.DENIED) {
      throw new NotFoundException('This procedure is already denied');
    }

    procedure.authorizationStatus = AuthorizationStatus.AUTHORIZED;
    procedure.authorizedAt = new Date();

    await this.procedureRepository.save(procedure);

    return this.toResponse(procedure);
  }

  async denyProcedure(id: number): Promise<ProcedureResponseDto> {
    const procedure = await this.findEntityOrFail(id);

    if (!(procedure instanceof SpecializedProcedure)) {
      throw new NotFoundException('Only specialized procedures can be denied');
    }

    if (!procedure.isPending()) {
      throw new NotFoundException(
        'This procedure does not require authorization',
      );
    }

    procedure.authorizationStatus = AuthorizationStatus.DENIED;
    procedure.deniedAt = new Date();

    await this.procedureRepository.save(procedure);

    return this.toResponse(procedure);
  }

  async remove(id: number): Promise<void> {
    const procedure = await this.findEntityOrFail(id);
    await this.procedureRepository.remove(procedure);
  }
}
