import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ComplexityLevel } from '../enum/complexity-level.enum';
import { ProcedureType } from '../enum/procedure-type.enum';

export class CreateProcedureDto {
  @ApiProperty({ example: 'Exame de sangue' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example:
      'Procedimento laboratorial que analisa amostras de sangue para diagnóstico, monitoramento ou prevenção.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: ProcedureType, example: ProcedureType.SIMPLE })
  @IsEnum(ProcedureType)
  type!: ProcedureType;

  @ApiPropertyOptional({
    example: 30,
    description: 'Duração estimada em minutos. Usado em procedimentos simples.',
  })
  @ValidateIf((dto: CreateProcedureDto) => dto.type === ProcedureType.SIMPLE)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDuration?: number;

  @ApiPropertyOptional({
    example: 'Aparelho de ultrassom',
    description: 'Equipamento necessário. Usado em procedimentos especializados.',
  })
  @ValidateIf(
    (dto: CreateProcedureDto) => dto.type === ProcedureType.SPECIALIZED,
  )
  @IsString()
  @IsOptional()
  requiredEquipment?: string;

  @ApiPropertyOptional({
    enum: ComplexityLevel,
    example: ComplexityLevel.MEDIUM,
    description: 'Nível de complexidade do procedimento especializado.',
  })
  @ValidateIf(
    (dto: CreateProcedureDto) => dto.type === ProcedureType.SPECIALIZED,
  )
  @IsEnum(ComplexityLevel)
  @IsOptional()
  complexityLevel?: ComplexityLevel;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica se o procedimento especializado exige autorização.',
  })
  @ValidateIf(
    (dto: CreateProcedureDto) => dto.type === ProcedureType.SPECIALIZED,
  )
  @IsBoolean()
  @IsOptional()
  requiresAuthorization?: boolean;
}
