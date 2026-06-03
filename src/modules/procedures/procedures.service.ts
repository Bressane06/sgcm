import { Injectable } from '@nestjs/common';
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

@Injectable()
export class ProceduresService {
  constructor(
    @InjectRepository(Procedure)
    private readonly procedureRepository: Repository<Procedure>,
  ) {}

  create(createProcedureDto: CreateProcedureDto, currentUser: UserPayload) {
    return 'This action adds a new procedure';
  }

  findAll(currentUser: UserPayload) {
    return `This action returns all procedures`;
  }

  findOne(id: number, CurrentUser: UserPayload) {
    return `This action returns a #${id} procedure`;
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

  remove(id: number) {
    return `This action removes a #${id} procedure`;
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
}
