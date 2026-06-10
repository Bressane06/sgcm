import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ComplexityLevel } from '../enum/complexity-level.enum';

export class UpdateProcedureDto {
  @ApiPropertyOptional({ example: 'Exame de sangue atualizado' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Descrição atualizada do procedimento.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 30 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedDuration?: number;

  @ApiPropertyOptional({ example: 'Aparelho de ultrassom' })
  @IsString()
  @IsOptional()
  requiredEquipment?: string;

  @ApiPropertyOptional({
    enum: ComplexityLevel,
    example: ComplexityLevel.MEDIUM,
  })
  @IsEnum(ComplexityLevel)
  @IsOptional()
  complexityLevel?: ComplexityLevel;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  requiresAuthorization?: boolean;
}