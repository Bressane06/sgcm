import { ApiProperty } from '@nestjs/swagger';
import { ProcedureType } from '../enum/procedure-type.enum';
import { IsEnum } from 'class-validator';

export class CreateProcedureDto {
  @ApiProperty({ example: 'Exame de sangue' })
  name!: string;

  @ApiProperty({
    example:
      'é um procedimento laboratorial que analisa amostras de sangue para diagnosticar, monitorar ou prevenir doenças',
  })
  description!: string;

  @ApiProperty({ enum: ProcedureType, example: ProcedureType.SIMPLE })
  @IsEnum(ProcedureType)
  type!: ProcedureType;

  @ApiProperty({ example: 30, required: false })
  estimatedDuration?: number;

  @ApiProperty({ example: 'Equipamento necessário', required: false })
  requiredEquipment?: string;

  @ApiProperty({ example: 'Média', required: false })
  complexityLevel?: string;

  @ApiProperty({ example: true, required: false })
  requiresAuthorization?: boolean;
}
