import { ApiProperty } from '@nestjs/swagger';

export class ReportPersonDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Maria Souza' })
  name!: string;

  @ApiProperty({ example: 'maria@sgcm.com' })
  email!: string;
}