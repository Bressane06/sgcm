import { Injectable } from '@nestjs/common';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { UserPayload } from '../auth/models/user-payload.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Procedure } from './entities/procedure.entity';
import { Repository } from 'typeorm';

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

  update(
    id: number,
    updateProcedureDto: UpdateProcedureDto,
    currentUser: UserPayload,
  ) {
    return `This action updates a #${id} procedure`;
  }

  authorizeProcedure(id: number) {
    // const procedure = await this.findEntiryOrFail()
    return `Autorizar procedimento especializado.`;
  }

  denyProcedure(id: number) {
    return `Negar procedimento especializado.`;
  }

  remove(id: number) {
    return `This action removes a #${id} procedure`;
  }
}
