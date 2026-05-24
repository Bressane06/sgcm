import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../enum/user-type.enum';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Maria Souza' })
  name!: string;

  @ApiProperty({ example: 'maria@sgcm.com' })
  email!: string;

  @ApiProperty({ enum: UserType, example: UserType.PATIENT })
  type!: UserType;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-05-24T09:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-05-24T09:00:00.000Z' })
  updatedAt!: Date;
}