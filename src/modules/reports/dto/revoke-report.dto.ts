import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RevokeReportDto {
  @ApiProperty({ example: 'Erro de emissão identificado após revisão.' })
  @IsString()
  @IsNotEmpty()
  revokedReason!: string;
}