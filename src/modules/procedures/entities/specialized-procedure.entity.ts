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
    enum: ComplexityLevel,
    nullable: true,
  })
  complexityLevel?: ComplexityLevel;

  @Column({ nullable: true })
  requiresAuthorization?: boolean;

  @Column({
    type: 'varchar',
    enum: AuthorizationStatus,
    nullable: true,
  })
  authorizationStatus?: AuthorizationStatus;

  @Column({ nullable: true })
  authorizedAt?: Date;

  @Column({ nullable: true })
  deniedAt?: Date;

  authorize(): void {
    if (!this.requiresAuthorization) {
      this.authorizationStatus = AuthorizationStatus.AUTHORIZED;
      this.authorizedAt = new Date();
      return;
    }

    this.authorizationStatus = AuthorizationStatus.AUTHORIZED;
    this.authorizedAt = new Date();
  }

  deny(): void {
    this.authorizationStatus = AuthorizationStatus.DENIED;
    this.deniedAt = new Date();
  }

  isPending(): boolean | undefined {
    return (
      this.requiresAuthorization &&
      this.authorizationStatus === AuthorizationStatus.PENDING
    );
  }

  canBePerformed(): boolean {
    if (!this.requiresAuthorization) return true;
    return this.authorizationStatus === AuthorizationStatus.AUTHORIZED;
  }
}
