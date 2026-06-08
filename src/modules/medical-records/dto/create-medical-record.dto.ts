import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsString()
  @IsNotEmpty()
  diagnosis!: string;

  @IsString()
  @IsNotEmpty()
  prescriptions!: string;

  @IsString()
  @IsNotEmpty()
  notes!: string;

  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  doctorId!: number;
}
