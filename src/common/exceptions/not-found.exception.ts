import { AppException } from './app.exception';

export class NotFoundException extends AppException {
  constructor(
    resource: string,
    identifier?: string | number,
  ) {
    const detail = identifier
      ? `${resource} com id ${identifier} não foi encontrado.`
      : `${resource} não foi encontrado.`;

    super(
      'https://sgcm.example.com/problems/not-found',
      'Recurso não encontrado',
      404,
      detail,
    );
    this.name = 'NotFoundException';
  }
}
