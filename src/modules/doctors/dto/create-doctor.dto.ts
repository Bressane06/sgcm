import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';

export class CreateDoctorDto extends CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'CRM é obrigatório para médicos' })
  declare crm: string; 
}