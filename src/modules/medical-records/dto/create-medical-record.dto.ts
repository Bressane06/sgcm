import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMedicalRecordDto {
  @ApiProperty({
    example: 'Hipertensão arterial sistêmica',
    description: 'Diagnóstico registrado pelo médico',
  })
  @IsString()
  @IsNotEmpty()
  diagnosis!: string;

  @ApiProperty({
    example: 'Losartana 50mg, 1 comprimido ao dia',
    description: 'Prescrições e medicamentos indicados ao paciente',
  })
  @IsString()
  @IsNotEmpty()
  prescriptions!: string;

  @ApiProperty({
    example: 'Paciente apresentou melhora dos sintomas e pressão controlada.',
    description: 'Observações complementares do atendimento',
  })
  @IsString()
  @IsNotEmpty()
  notes!: string;
}
