import { AppException } from './app.exception';

export class UnauthorizedException extends AppException {
  constructor(detail: string = 'Não autorizado') {
    super(
      'https://sgcm.example.com/problems/unauthorized',
      'Não autorizado',
      401,
      detail,
    );
  }
}
