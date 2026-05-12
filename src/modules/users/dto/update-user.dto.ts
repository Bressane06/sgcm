import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
	@ApiPropertyOptional({ example: 'Maria Silva' })
	@IsOptional()
	@IsString()
	@IsNotEmpty({ message: 'Nome não pode ser vazio' })
	name?: string;

	@ApiPropertyOptional({ example: 'maria.silva@example.com' })
	@IsOptional()
	@IsEmail({}, { message: 'E-mail deve ser um formato válido' })
	email?: string;

	@ApiPropertyOptional({ example: 'ADMIN' })
	@IsOptional()
	@IsString()
	@IsNotEmpty({ message: 'accessLevel não pode ser vazio' })
	accessLevel?: string;

	@ApiPropertyOptional({ example: '123456-SP' })
	@IsOptional()
	@IsString()
	@IsNotEmpty({ message: 'CRM não pode ser vazio' })
	crm?: string;
}
