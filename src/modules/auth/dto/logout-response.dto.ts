import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    example: 'Logout realizado com sucesso.',
  })
  message!: string;
}
