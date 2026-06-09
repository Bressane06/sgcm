import { ApiProperty } from '@nestjs/swagger';
import { ProcedureType } from '../enum/procedure-type.enum';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  ValidateIf,
} from 'class-validator';

export class CreateProcedureDto {
  @ApiProperty({ example: 'Exame de sangue' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example:
      'é um procedimento laboratorial que analisa amostras de sangue para diagnosticar, monitorar ou prevenir doenças',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: ProcedureType, example: ProcedureType.SIMPLE })
  @IsEnum(ProcedureType)
  type!: ProcedureType;

  @ApiProperty({ example: 30, required: false })
  @ValidateIf((dto: CreateProcedureDto) => dto.type === ProcedureType.SIMPLE)
  @IsNumber()
  @IsOptional()
  estimatedDuration?: number;

  @ApiProperty({ example: 'Equipamento necessário', required: false })
  @ValidateIf(
    (dto: CreateProcedureDto) => dto.type === ProcedureType.SPECIALIZED,
  )
  @IsString()
  @IsOptional()
  requiredEquipment?: string;

  @ValidateIf(
    (dto: CreateProcedureDto) => dto.type === ProcedureType.SPECIALIZED,
  )
  @ApiProperty({ example: 'Média', required: false })
  @IsString()
  @IsOptional()
  complexityLevel?: string;

  @ValidateIf(
    (dto: CreateProcedureDto) => dto.type === ProcedureType.SPECIALIZED,
  )
  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  requiresAuthorization?: boolean;
}
