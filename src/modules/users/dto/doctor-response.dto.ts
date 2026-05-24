import { ApiProperty } from '@nestjs/swagger';

export class DoctorResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  userId!: number;

  @ApiProperty({ example: 'Dr. João Lima' })
  name!: string;

  @ApiProperty({ example: 'joao@sgcm.com' })
  email!: string;

  @ApiProperty({ example: 'CRM/SP-123456' })
  crm!: string;
}