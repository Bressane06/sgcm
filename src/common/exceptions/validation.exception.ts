import { AppException } from './app.exception';

export class ValidationException extends AppException {
  constructor(
    detail: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(
      'https://sgcm.example.com/problems/validation-error',
      'Erro de validação',
      400,
      detail,
    );
    this.name = 'ValidationException';
  }
}
