import { IsNotEmpty, isNumber, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class CreateDoctorDto extends CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'CRM é obrigatório para médicos' })
  declare crm: string;
}
