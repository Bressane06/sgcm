import { IsNotEmpty, IsString, IsDate, MaxDate } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsCPF } from 'class-validator-cpf';
import { CreateUserDto } from './create-user.dto';

export class CreatePatientDto extends CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsCPF({ message: 'CPF inválido' })
  declare cpf: string;

  @Type(() => Date)
  @IsDate({ message: 'Data de nascimento inválida' })
  @IsNotEmpty({ message: 'Data de nascimento é obrigatória' })
  @MaxDate(new Date(), { message: 'Data de nascimento deve estar no passado' })
  declare birthDate: Date;
}
