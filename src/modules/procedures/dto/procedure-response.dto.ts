// procedure-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ProcedureType } from '../enum/procedure-type.enum';
import { AuthorizationStatus } from '../enum/authorization-status.enum';
import { ComplexityLevel } from '../enum/complexity-level.enum';

export class ProcedureResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  appointmentId: number;

  @ApiProperty({ example: 'Curativo simples' })
  name: string;

  @ApiProperty({ example: 'Limpeza e curativo em ferida superficial' })
  description: string;

  @ApiProperty({ enum: ProcedureType })
  type: ProcedureType;

  // SimpleProcedure
  @ApiProperty({ required: false, example: 15 })
  estimatedDuration?: number;

  // SpecializedProcedure
  @ApiProperty({ required: false, example: 'Bisturi elétrico' })
  requiredEquipment?: string;

  @ApiProperty({ required: false, enum: ComplexityLevel })
  complexityLevel?: ComplexityLevel;

  @ApiProperty({ required: false, example: true })
  requiresAuthorization?: boolean;

  @ApiProperty({ required: false, enum: AuthorizationStatus })
  authorizationStatus?: AuthorizationStatus;

  @ApiProperty({ required: false, example: '2026-06-10T14:00:00.000Z' })
  authorizedAt?: Date;

  @ApiProperty({ required: false, example: null })
  deniedAt?: Date;

  @ApiProperty({ example: '2026-06-10T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-10T12:00:00.000Z' })
  updatedAt: Date;
}
