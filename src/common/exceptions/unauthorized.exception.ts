import { AppException } from './app.exception';

export class UnauthorizedException extends AppException {
  constructor(detail: string = 'Não autenticado') {
    super(
      'https://sgcm.example.com/problems/unauthorized',
      'Não autenticado',
      401,
      detail,
    );
  }
}
