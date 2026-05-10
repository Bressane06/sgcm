import { AppException } from './app.exception';

export class NotFoundException extends AppException {
  // Assinaturas de sobrecarga (sem corpo)
  constructor(resource: string, identifier?: string | number);
  constructor(resource: string, identifier: string, identifierIsName: boolean);
  
  constructor(resource: string, identifier?: string | number, identifierIsName?: boolean) {
    const detail = identifier
      ? `${resource} com ${identifierIsName ? 'nome' : 'id'} ${identifier} não foi encontrado.`
      : `${resource} não foi encontrado.`;

    super(
      'https://sgcm.example.com/problems/not-found',
      'Recurso não encontrado',
      404,
      detail,
    );
  }
}
