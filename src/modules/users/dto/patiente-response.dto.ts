import { Expose } from 'class-transformer';
import { UserResponseDto } from './user-response.dto';

export class PatientResponseDto extends UserResponseDto {

  @Expose()
  cpf: string;

  @Expose()
  birthDate: Date;
}