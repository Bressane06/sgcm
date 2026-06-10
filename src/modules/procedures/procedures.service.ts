import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
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
import { ConflictException, NotFoundException } from '../../common';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AppointmentStatus } from '../appointments/enum/appointment-status.enum';

@Injectable()
export class ProceduresService {
  constructor(
    @InjectRepository(Procedure)
    private readonly procedureRepository: Repository<Procedure>,
    @InjectRepository(SimpleProcedure)
    private readonly simpleProcedureRepository: Repository<SimpleProcedure>,
    @InjectRepository(SpecializedProcedure)
    private readonly specializedProcedureRepository: Repository<SpecializedProcedure>,
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

  private assertCanAccessAppointment(
    appointment: Appointment,
    currentUser: UserPayload,
  ): void {
    if (currentUser.type === 'ADMIN') {
      return;
    }

    if (
      currentUser.type === 'DOCTOR' &&
      appointment.schedule.doctorId === currentUser.sub
    ) {
      return;
    }

    if (
      currentUser.type === 'PATIENT' &&
      appointment.schedule.patientId === currentUser.sub
    ) {
      return;
    }

    throw new ForbiddenException('Usuário não tem acesso a este atendimento.');
  }

  private async findAppointmentOrFail(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: {
        schedule: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Atendimento', id);
    }

    return appointment;
  }

  private async findEntityOrFail(id: number): Promise<Procedure> {
    const procedure = await this.procedureRepository.findOne({
      where: { id },
      relations: {
        appointment: {
          schedule: true,
        },
      },
    });

    if (!procedure) {
      throw new NotFoundException('Procedimento', id);
    }

    return procedure;
  }

  async findByAppointment(
    appointmentId: number,
    currentUser: UserPayload,
  ): Promise<ProcedureResponseDto[]> {
    const appointment = await this.findAppointmentOrFail(appointmentId);

    this.assertCanAccessAppointment(appointment, currentUser);

    const procedures = await this.procedureRepository.find({
      where: { appointmentId },
      relations: {
        appointment: {
          schedule: true,
        },
      },
    });

    return procedures.map((procedure) => this.toResponse(procedure));
  }

  private toResponse(procedure: Procedure): ProcedureResponseDto {
    const response: ProcedureResponseDto = {
      id: procedure.id,
      appointmentId: procedure.appointmentId,
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
    this.assertCanAccessAppointment(appointment, user);

    if (appointment.status !== AppointmentStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Procedimentos só podem ser criados para atendimentos em andamento.',
      );
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

        const saved = await this.simpleProcedureRepository.save(procedure); // <--
        return this.toResponse(saved);
      }

      case ProcedureType.SPECIALIZED: {
        const procedure = new SpecializedProcedure();
        Object.assign(procedure, baseData);
        procedure.requiredEquipment = dto.requiredEquipment;
        procedure.complexityLevel = dto.complexityLevel;
        procedure.requiresAuthorization = dto.requiresAuthorization ?? true;
        procedure.authorizationStatus = procedure.requiresAuthorization
          ? AuthorizationStatus.PENDING
          : AuthorizationStatus.AUTHORIZED;

        const saved = await this.specializedProcedureRepository.save(procedure); // <--
        return this.toResponse(saved);
      }

      default:
        throw new BadRequestException('Tipo de procedimento inválido.');
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
    this.assertCanAccessAppointment(procedure.appointment, currentUser);

    return this.toResponse(procedure);
  }

  async update(
    id: number,
    updateProcedureDto: UpdateProcedureDto,
    currentUser: UserPayload,
  ): Promise<ProcedureResponseDto> {
    const procedure = await this.findEntityOrFail(id);

    this.assertCanAccessAppointment(procedure.appointment, currentUser);

    if (procedure instanceof SimpleProcedure) {
      if (updateProcedureDto.requiredEquipment !== undefined) {
        throw new BadRequestException(
          'requiredEquipment não é permitido para procedimento simples.',
        );
      }

      if (updateProcedureDto.complexityLevel !== undefined) {
        throw new BadRequestException(
          'complexityLevel não é permitido para procedimento simples.',
        );
      }

      if (updateProcedureDto.requiresAuthorization !== undefined) {
        throw new BadRequestException(
          'requiresAuthorization não é permitido para procedimento simples.',
        );
      }

      Object.assign(procedure, {
        name: updateProcedureDto.name ?? procedure.name,
        description: updateProcedureDto.description ?? procedure.description,
        estimatedDuration:
          updateProcedureDto.estimatedDuration ?? procedure.estimatedDuration,
      });
    }

    if (procedure instanceof SpecializedProcedure) {
      if (updateProcedureDto.estimatedDuration !== undefined) {
        throw new BadRequestException(
          'estimatedDuration não é permitido para procedimento especializado.',
        );
      }

      Object.assign(procedure, {
        name: updateProcedureDto.name ?? procedure.name,
        description: updateProcedureDto.description ?? procedure.description,
        requiredEquipment:
          updateProcedureDto.requiredEquipment ?? procedure.requiredEquipment,
        complexityLevel:
          updateProcedureDto.complexityLevel ?? procedure.complexityLevel,
        requiresAuthorization:
          updateProcedureDto.requiresAuthorization ??
          procedure.requiresAuthorization,
      });
    }

    const saved = await this.procedureRepository.save(procedure);
    return this.toResponse(saved);
  }

  async authorizeProcedure(id: number): Promise<ProcedureResponseDto> {
    const procedure = await this.findEntityOrFail(id);

    if (procedure.type !== ProcedureType.SPECIALIZED) {
      throw new BadRequestException(
        'Apenas procedimentos especializados podem ser autorizados.',
      );
    }

    const specialized = procedure as SpecializedProcedure;

    if (!specialized.isPending()) {
      throw new BadRequestException(
        'Este procedimento não está pendente de autorização.',
      );
    }

    specialized.authorize();

    const saved = await this.procedureRepository.save(specialized);
    return this.toResponse(saved);
  }

  async denyProcedure(id: number): Promise<ProcedureResponseDto> {
    const procedure = await this.findEntityOrFail(id);

    if (!(procedure instanceof SpecializedProcedure)) {
      throw new BadRequestException(
        'Apenas procedimentos especializados podem ser negados.',
      );
    }

    if (!procedure.isPending()) {
      throw new BadRequestException(
        'Este procedimento não está pendente de autorização.',
      );
    }

    procedure.deny();

    const saved = await this.procedureRepository.save(procedure);
    return this.toResponse(saved);
  }

  async remove(id: number, currentUser: UserPayload): Promise<void> {
    const procedure = await this.findEntityOrFail(id);
    this.assertCanAccessAppointment(procedure.appointment, currentUser);

    if (procedure.appointment.status === AppointmentStatus.FINISHED) {
      throw new ConflictException(
        'Não é possível excluir procedimentos de atendimentos encerrados.',
      );
    }

    await this.procedureRepository.remove(procedure);
  }
}
