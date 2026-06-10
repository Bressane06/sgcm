import { IsNotEmpty, IsString, IsDate, MaxDate } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsCPF } from 'class-validator-cpf';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto extends CreateUserDto {
  @ApiProperty({ example: '12345678901' })
  @IsString()
  @IsNotEmpty({ message: 'CPF é obrigatório' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsCPF({ message: 'CPF inválido' })
  declare cpf: string;

  @Type(() => Date)
  @ApiProperty({ example: '1995-03-10' })
  @IsDate({ message: 'Data de nascimento inválida' })
  @IsNotEmpty({ message: 'Data de nascimento é obrigatória' })
  @MaxDate(new Date(), { message: 'Data de nascimento deve estar no passado' })
  declare birthDate: Date;
}
