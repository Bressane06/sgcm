import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { UserType } from '../../users/enum/user-type.enum';

export class LoginDto {
  @ApiProperty({
    description: 'E-mail do usuário',
    example: 'medico@sgcm.com',
  })
  @IsEmail({}, { message: 'E-mail deve ser um formato válido' })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  email!: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'Senha@123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password!: string;

  @ApiProperty({
    description: 'Tipo do usuário (ADMIN, DOCTOR, PATIENT)',
    example: 'ADMIN',
  })
  @IsNotEmpty({ message: 'Tipo de usuário é obrigatório' })
  @IsString({ message: 'Tipo de usuário deve ser uma string' })
  type!: UserType;
}
