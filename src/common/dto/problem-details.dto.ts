import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// RFC 7807 - Padrão exigido no trabalho
export class ProblemDetailsDto {
  @ApiProperty({ example: 'https://sgcm.example.com/problems/bad-request' })
  type: string;

  @ApiProperty({ example: 'Requisição inválida' })
  title: string;

  @ApiProperty({ example: 400 })
  status: number;

  @ApiPropertyOptional({ example: 'Um ou mais campos de validação falharam.' })
  detail?: string;

  @ApiPropertyOptional({ example: '/users' })
  instance?: string;

  @ApiPropertyOptional({ example: 'POST' })
  method?: string;

  @ApiPropertyOptional({ example: '2026-06-09T10:00:00Z' })
  timestamp?: string;

  @ApiPropertyOptional({ example: 'req-123-abc' })
  traceId?: string;

  @ApiPropertyOptional({
    example: { email: ['E-mail inválido'], password: ['Senha muito curta'] },
  })
  errors?: Record<string, string[]>;
}
