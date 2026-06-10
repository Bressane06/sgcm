// create-specialized-procedure.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ProcedureType } from '../enum/procedure-type.enum';
import { ComplexityLevel } from '../enum/complexity-level.enum';

export class CreateSpecializedProcedureDto {
  @ApiProperty({ example: 'Ressonância magnética' })
  name: string;

  @ApiProperty({ example: 'Ressonância de coluna lombar com contraste' })
  description: string;

  @ApiProperty({ enum: ProcedureType, example: ProcedureType.SPECIALIZED })
  type: ProcedureType.SPECIALIZED;

  @ApiProperty({ example: 'Equipamento de RM 3T', required: false })
  requiredEquipment?: string;

  @ApiProperty({
    enum: ComplexityLevel,
    example: ComplexityLevel.HIGH,
    required: false,
  })
  complexityLevel?: ComplexityLevel;

  @ApiProperty({
    example: true,
    description: 'Se true, inicia com authorizationStatus = PENDING',
  })
  requiresAuthorization?: boolean;
}
