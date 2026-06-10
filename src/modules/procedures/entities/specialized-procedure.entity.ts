import { ChildEntity, Column } from 'typeorm';
import { AuthorizationStatus } from '../enum/authorization-status.enum';
import { ComplexityLevel } from '../enum/complexity-level.enum';
import { Procedure } from './procedure.entity';
import { ProcedureType } from '../enum/procedure-type.enum';

@ChildEntity(ProcedureType.SPECIALIZED)
export class SpecializedProcedure extends Procedure {
  @Column({ nullable: true })
  requiredEquipment?: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  complexityLevel?: ComplexityLevel;

  @Column({ default: true })
  requiresAuthorization!: boolean;

  @Column({
    type: 'varchar',
    default: AuthorizationStatus.PENDING,
  })
  authorizationStatus?: AuthorizationStatus;

  @Column({ nullable: true })
  authorizedAt?: Date;

  @Column({ nullable: true })
  deniedAt?: Date;

  authorize(): void {
    this.authorizationStatus = AuthorizationStatus.AUTHORIZED;
    this.authorizedAt = new Date();
    this.deniedAt = undefined;
  }

  deny(): void {
    this.authorizationStatus = AuthorizationStatus.DENIED;
    this.deniedAt = new Date();
    this.authorizedAt = undefined;
  }

  isPending(): boolean {
    return this.authorizationStatus === AuthorizationStatus.PENDING;
  }

  canBePerformed(): boolean {
    return this.authorizationStatus === AuthorizationStatus.AUTHORIZED;
  }
}
