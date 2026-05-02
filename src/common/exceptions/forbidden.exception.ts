import { AppException } from './app.exception';

export class ForbiddenException extends AppException {
  constructor(detail: string = 'Acesso proibido') {
    super(
      'https://sgcm.example.com/problems/forbidden',
      'Acesso proibido',
      403,
      detail,
    );
    this.name = 'ForbiddenException';
  }
}
