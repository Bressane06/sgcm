import { Expose } from 'class-transformer';
import { UserResponseDto } from './user-response.dto';

export class DoctorResponseDto extends UserResponseDto {

  @Expose()
  crm: string;
}