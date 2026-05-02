// RFC 7807 - Padrão exigido no trabalho
export class ProblemDetailsDto {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  method?: string;
  timestamp?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}
