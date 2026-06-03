import { ApiProperty } from '@nestjs/swagger';
import { ProcedureType } from '../enum/procedure-type.enum';

export class ProcedureResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Procedure Name' })
  name!: string;

  @ApiProperty({ example: 'Procedure Description' })
  description!: string;

  @ApiProperty({ example: 'Procedure Type' })
  type!: ProcedureType;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z' })
  updatedAt!: Date;

  // Campos específicos para SimpleProcedure
  @ApiProperty({ example: 30, required: false })
  estimatedDuration?: number;

  // Campos específicos para SpecializedProcedure
  @ApiProperty({ example: 'Equipamento necessário', required: false })
  requiredEquipment?: string;

  @ApiProperty({ example: 'Média', required: false })
  complexityLevel?: string;

  @ApiProperty({ example: true, required: false })
  requiresAuthorization?: boolean;

  @ApiProperty({ example: 'PENDENTE', required: false })
  authorizationStatus?: string;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', required: false })
  authorizedAt?: Date;

  @ApiProperty({ example: '2023-01-01T00:00:00Z', required: false })
  deniedAt?: Date;
}
