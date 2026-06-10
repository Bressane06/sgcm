import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';
import { ComplexityLevel } from '../enum/complexity-level.enum';
import { ProcedureType } from '../enum/procedure-type.enum';

// create-procedure.dto.ts — SEM @ApiProperty, só validação
export class CreateProcedureDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(ProcedureType)
  type: ProcedureType;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedDuration?: number;

  @IsOptional()
  @IsString()
  requiredEquipment?: string;

  @IsOptional()
  @IsEnum(ComplexityLevel)
  complexityLevel?: ComplexityLevel;

  @IsOptional()
  @IsBoolean()
  requiresAuthorization?: boolean;
}
