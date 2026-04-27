import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, ValidateIf, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '../enum/user-type.enum';
import { Type } from 'class-transformer';

export class CreateUserDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
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

	@ApiPropertyOptional()
	@ValidateIf(o => o.type === UserType.ADMIN)
	@IsNotEmpty()
	accessLevel?: string;

	@ApiPropertyOptional()
	@ValidateIf(o => o.type === UserType.DOCTOR)
	@IsNotEmpty()
	crm?: string;

	@ApiPropertyOptional()
	@ValidateIf(o => o.type === UserType.PATIENT)
	@IsNotEmpty()
	cpf?: string;

	@ApiPropertyOptional()
	@ValidateIf(o => o.type === UserType.PATIENT)
	@IsDate()
	@Type(() => Date)
	birthDate?: Date;
}