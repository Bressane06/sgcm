import { ChildEntity, Column, Entity } from 'typeorm';
import { AuthorizationStatus } from '../enum/authorization-status.enum';
import { ComplexityLevel } from '../enum/complexity-level.enum';
import { Procedure } from './procedure.entity';
import { ProcedureType } from '../enum/procedure-type.enum';

@Entity('specialized_procedures')
@ChildEntity(ProcedureType.SPECIALIZED)
export class SpecializedProcedure extends Procedure {
  @Column()
  requiredEquipment!: string;

  @Column({
    type: 'enum',
    enum: ComplexityLevel,
  })
  complexityLevel!: ComplexityLevel;

  @Column()
  requiresAuthorization!: boolean;

  @Column({
    type: 'enum',
    enum: AuthorizationStatus,
  })
  authorizationStatus!: AuthorizationStatus;

  @Column({ nullable: true })
  authorizedAt!: Date | null;

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
    this.authorizedAt = null;
  }

  isPending(): boolean {
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
