import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
  IsDate,
  MaxDate,
  MaxLength,
  Matches,
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
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
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
  @MaxDate(new Date(), { message: 'Data de nascimento deve estar no passado' })
  @Type(() => Date)
  birthDate?: Date;
}
