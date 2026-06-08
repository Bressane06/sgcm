import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateReportDto {

  @ApiProperty({ example: 'MRI' })
  @IsString()
  @IsNotEmpty()
  examType!: string;

  @ApiProperty({ example: 'Exame sem alterações relevantes.' })
  @IsString()
  @IsNotEmpty()
  result!: string;
}