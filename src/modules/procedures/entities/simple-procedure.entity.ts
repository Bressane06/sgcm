import { ChildEntity, Column } from 'typeorm';
import { ProcedureType } from '../enum/procedure-type.enum';
import { Procedure } from './procedure.entity';

@ChildEntity(ProcedureType.SIMPLE)
export class SimpleProcedure extends Procedure {
  @Column({ nullable: true })
  estimatedDuration?: number; // em minutos
}
