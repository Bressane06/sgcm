import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class OccupationQueryDto {
  @ApiPropertyOptional({
    description: 'Data inicial do período (ISO 8601)',
    example: '2026-05-05',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Data final do período (ISO 8601)',
    example: '2029-06-05',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
