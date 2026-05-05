import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto extends CreateUserDto {
  @ApiProperty({
    description: 'CRM do médico',
    example: '123456/SP'
  })
  @IsString()
  @IsNotEmpty({ message: 'CRM é obrigatório para médicos' })
  declare crm: string;
}
