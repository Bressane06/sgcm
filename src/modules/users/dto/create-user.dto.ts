import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
  IsDate,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '../enum/user-type.enum';
import { Type, Transform } from 'class-transformer';
import { IsCPF } from 'class-validator-cpf';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name!: string;

  @ApiProperty()
  @IsEmail({}, { message: 'E-mail deve ser um formato válido' })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  email!: string;

  @ApiProperty()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password!: string;

  @ApiProperty({ enum: UserType })
  @IsEnum(UserType, { message: 'Tipo de usuário inválido' })
  type!: UserType;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateUserDto) => o.type === UserType.ADMIN)
  @IsNotEmpty()
  accessLevel?: string;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateUserDto) => o.type === UserType.DOCTOR)
  @IsNotEmpty()
  crm?: string;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateUserDto) => o.type === UserType.PATIENT)
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsCPF({ message: 'CPF inválido' })
  cpf?: string;

  @ApiPropertyOptional()
  @ValidateIf((o: CreateUserDto) => o.type === UserType.PATIENT)
  @IsDate()
  @Type(() => Date)
  birthDate?: Date;
}
