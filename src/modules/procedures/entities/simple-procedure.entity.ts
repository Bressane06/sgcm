import { ChildEntity, Column } from 'typeorm';
import { ProcedureType } from '../enum/procedure-type.enum';
import { Procedure } from './procedure.entity';
import { IsNumber } from 'class-validator';

@ChildEntity(ProcedureType.SIMPLE)
export class SimpleProcedure extends Procedure {
  @Column({ nullable: true })
  @IsNumber()
  estimatedDuration?: number; // em minutos
}
