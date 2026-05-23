import { AppException } from './app.exception';

export class ForbiddenException extends AppException {
  constructor(detail: string = 'Acesso negado') {
    super(
      'https://sgcm.example.com/problems/forbidden',
      'Acesso negado',
      403,
      detail,
    );
  }
}
