import { IsString, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';

export class CreateDoctorDto extends CreateUserDto {
  @IsString()
  @IsNotEmpty()
  crm: string;
}