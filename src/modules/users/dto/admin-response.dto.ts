import { Expose } from 'class-transformer';
import { UserResponseDto } from './user-response.dto';

export class AdminResponseDto extends UserResponseDto {

  @Expose()
  accessLevel: string;
}