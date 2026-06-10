import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthorizationStatus } from '../enum/authorization-status.enum';
import { ComplexityLevel } from '../enum/complexity-level.enum';
import { ProcedureType } from '../enum/procedure-type.enum';

export class ProcedureResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  appointmentId!: number;

  @ApiProperty({ example: 'Exame de sangue' })
  name!: string;

  @ApiProperty({
    example:
      'Procedimento laboratorial que analisa amostras de sangue para diagnóstico.',
  })
  description!: string;

  @ApiProperty({ enum: ProcedureType, example: ProcedureType.SIMPLE })
  type!: ProcedureType;

  @ApiProperty({ example: '2026-06-03T17:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-06-03T17:00:00.000Z' })
  updatedAt!: Date;

  // Campos específicos para SimpleProcedure
  @ApiPropertyOptional({ example: 30 })
  estimatedDuration?: number;

  // Campos específicos para SpecializedProcedure
  @ApiPropertyOptional({ example: 'Aparelho de ultrassom' })
  requiredEquipment?: string;

  @ApiPropertyOptional({
    enum: ComplexityLevel,
    example: ComplexityLevel.MEDIUM,
  })
  complexityLevel?: ComplexityLevel;

  @ApiPropertyOptional({ example: true })
  requiresAuthorization?: boolean;

  @ApiPropertyOptional({
    enum: AuthorizationStatus,
    example: AuthorizationStatus.PENDING,
  })
  authorizationStatus?: AuthorizationStatus;

  @ApiPropertyOptional({ example: '2026-06-03T17:00:00.000Z' })
  authorizedAt?: Date;

  @ApiPropertyOptional({ example: '2026-06-03T17:00:00.000Z' })
  deniedAt?: Date;
}
