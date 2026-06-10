import { ApiProperty } from '@nestjs/swagger';

export class MedicalRecordResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  patientId!: number;

  @ApiProperty({ example: 1 })
  updatedBy!: number;

  @ApiProperty({ example: 1 })
  appointmentId!: number;

  @ApiProperty({ example: 'Hipertensão arterial sistêmica' })
  diagnosis!: string;

  @ApiProperty({
    example: 'Paciente relata cefaleia recorrente há 2 semanas.',
    required: false,
    nullable: true,
  })
  notes?: string | null;

  @ApiProperty({
    example: 'Losartana 50mg 1x ao dia',
    required: false,
    nullable: true,
  })
  prescriptions?: string | null;

  @ApiProperty({ example: '2026-06-01T14:30:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-06-02T09:15:00.000Z' })
  updatedAt!: Date;
}
