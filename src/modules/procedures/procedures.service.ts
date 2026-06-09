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
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly simpleProcedureRepository: Repository<SimpleProcedure>,
    private readonly specializedProcedureRepository: Repository<SpecializedProcedure>,
  ) {}

  private assertAllowedFieldsForType(dto: CreateProcedureDto): void {
    const receivedWrongFieldsByType: Record<ProcedureType, string[]> = {
      [ProcedureType.SIMPLE]: [
        ...(dto.estimatedDuration ? ['estimatedDuration'] : []),
      ],
      [ProcedureType.SPECIALIZED]: [
        ...(dto.complexityLevel ? ['complexityLevel'] : []),
        ...(dto.requiredEquipment ? ['requiredEquipment'] : []),
        ...(dto.requiresAuthorization ? ['requiresAuthorization'] : []),
      ],
    };

    const wrongFields = receivedWrongFieldsByType[dto.type];

    if (wrongFields.length > 0) {
      throw new BadRequestException(
        `Campos inválidos para procedimento ${dto.type}: ${wrongFields.join(', ')}.`,
      );
    }
  }

  private async findAppointmentOrFail(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOneBy({ id });
    if (!appointment) {
      throw new NotFoundException(`Procedure with ID ${id} not found`);
    }

    return appointment;
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

    const baseData = { ...dto };

    switch (dto.type) {
      case ProcedureType.SIMPLE: {
        const procedure = await this.simpleProcedureRepository.save(
          this.simpleProcedureRepository.create({
            ...baseData,
            estimatedDuration: dto.estimatedDuration,
          }),
        );

        return this.toResponse(procedure);
      }

      case ProcedureType.SPECIALIZED: {
        const procedure = await this.specializedProcedureRepository.save(
          this.specializedProcedureRepository.create({
            ...baseData,
            authorizationStatus: AuthorizationStatus.PENDING,
          }),
        );
        return this.toResponse(procedure);
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

    if (!procedure) {
      throw new NotFoundException(`Procedure with ID ${id} not found`);
    }

    return this.toResponse(procedure);
  }

  async authorizeProcedure(id: number): Promise<Procedure> {
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

  async denyProcedure(id: number): Promise<Procedure> {
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
