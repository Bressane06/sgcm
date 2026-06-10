// create-simple-procedure.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { ProcedureType } from '../enum/procedure-type.enum';

export class CreateSimpleProcedureDto {
  @ApiProperty({
    example: 'Curativo simples',
    description: 'Nome do procedimento',
  })
  name: string;

  @ApiProperty({ example: 'Limpeza e curativo em ferida superficial' })
  description: string;

  @ApiProperty({ enum: ProcedureType, example: ProcedureType.SIMPLE })
  type: ProcedureType.SIMPLE;

  @ApiProperty({
    example: 15,
    description: 'Duração estimada em minutos',
    minimum: 1,
  })
  estimatedDuration?: number;
}
