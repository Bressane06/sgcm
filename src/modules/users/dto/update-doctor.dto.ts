import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

export class UpdateDoctorDto extends UpdateUserDto {
	@ApiPropertyOptional({ example: '123456-SP' })
	@IsOptional()
	@IsString()
	@IsNotEmpty({ message: 'CRM não pode ser vazio' })
	declare crm?: string;
}
