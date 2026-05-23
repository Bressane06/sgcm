import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

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
}
