import { ApiProperty } from '@nestjs/swagger';

export class SpecialtyResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({
    example: 'Cardiologia',
  })
  name!: string;

  @ApiProperty({
    example: 'Especialista em problemas cardíacos',
  })
  description!: string;

  @ApiProperty({
    example: '2026-06-01T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-06-02T15:30:00.000Z',
  })
  updatedAt!: Date;
}