import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { UserType } from '../enum/user-type.enum';

export class FindUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: UserType,
    example: UserType.DOCTOR,
    description: 'Filtra usuários pelo tipo de perfil.',
  })
  @IsOptional()
  @IsEnum(UserType)
  type?: UserType;
}
