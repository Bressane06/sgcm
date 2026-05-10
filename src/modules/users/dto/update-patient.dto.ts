import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsCPF } from 'class-validator-cpf';
import { UpdateUserDto } from './update-user.dto';

export class UpdatePatientDto extends UpdateUserDto {
	@ApiPropertyOptional({ example: '12345678909' })
	@IsOptional()
	@IsString()
	@Transform(({ value }) =>
		typeof value === 'string' ? value.replace(/\D/g, '') : value,
	)
	@IsCPF({ message: 'CPF inválido' })
	declare cpf?: string;

	@ApiPropertyOptional({ example: '1990-01-01T00:00:00.000Z' })
	@IsOptional()
	@Type(() => Date)
	@IsDate({ message: 'Data de nascimento inválida' })
	declare birthDate?: Date;
}
