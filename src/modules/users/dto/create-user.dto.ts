import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../enum/user-type.enum';

export class CreateUserDto {

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: UserType })
  @IsEnum(UserType)
  type!: UserType;

  // Verficar se o campo é necessário dependendo do tipo de usuário
  @ValidateIf(user => user.type === UserType.ADMIN)
  @IsNotEmpty()
  accessLevel?: string;

  @ValidateIf(user => user.type === UserType.DOCTOR)
  @IsNotEmpty()
  crm?: string;

  @ValidateIf(user => user.type === UserType.PATIENT)
  @IsNotEmpty()
  cpf?: string;

  @ValidateIf(user => user.type === UserType.PATIENT)
  @IsNotEmpty()
  birthDate?: Date;
  
}