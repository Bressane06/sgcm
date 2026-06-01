import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  patientId!: number;

  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(1)
  doctorId!: number;

  @ApiProperty({ example: 'MRI' })
  @IsString()
  @IsNotEmpty()
  examType!: string;

  @ApiProperty({ example: 'Exame sem alterações relevantes.' })
  @IsString()
  @IsNotEmpty()
  result!: string;
}