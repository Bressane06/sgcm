import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MaxDate, MaxLength, MinLength, ValidateIf } from "class-validator";
import { IsCPF } from "class-validator-cpf";
import { UserType } from "../enum/user-type.enum";

export class CreateUserDto {
  @ApiProperty({ example: 'Augusto Silva' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name!: string;

  @ApiProperty({ example: 'augusto.silva@email.com' })
  @IsEmail({}, { message: 'E-mail deve ser um formato válido' })
  @IsNotEmpty({ message: 'E-mail é obrigatório' })
  email!: string;

  @ApiProperty({ example: 'Senha@123' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password!: string;

  @ApiProperty({ enum: UserType, example: UserType.PATIENT })
  @IsEnum(UserType, { message: 'Tipo de usuário inválido' })
  type!: UserType;

  @ApiPropertyOptional({ example: 'Nível 1' })
  @ValidateIf((o: CreateUserDto) => o.type === UserType.ADMIN)
  @IsNotEmpty()
  accessLevel?: string;

  @ApiPropertyOptional({ example: '123456-SP' })
  @ValidateIf((o: CreateUserDto) => o.type === UserType.DOCTOR)
  @IsNotEmpty()
  crm?: string;

  @ApiPropertyOptional({ example: '12345678901' })
  @ValidateIf((o: CreateUserDto) => o.type === UserType.PATIENT)
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsCPF({ message: 'CPF inválido' })
  cpf?: string;

  @ApiPropertyOptional({ example: '1995-03-10' })
  @ValidateIf((o: CreateUserDto) => o.type === UserType.PATIENT)
  @IsDate()
  @MaxDate(new Date(), { message: 'Data de nascimento deve estar no passado' })
  @Type(() => Date)
  birthDate?: Date;
}
