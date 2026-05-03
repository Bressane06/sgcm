import { AppException } from './app.exception';

export class ConflictException extends AppException {
  constructor(detail: string, errors?: Record<string, string[]>) {
    super(
      'https://sgcm.example.com/problems/conflict',
      'Conflito',
      409,
      detail,
      undefined,
      errors,
    );
  }

  static uniqueConstraint(field: string, value?: string): ConflictException {
    const detail = value
      ? `${field} "${value}" já existe no sistema.`
      : `${field} já existe no sistema.`;
    const errors = { [field]: ['já existe'] };
    return new ConflictException(detail, errors);
  }

  static businessRule(rule: string, detail?: string): ConflictException {
    const message = detail ? `${rule}: ${detail}` : rule;
    return new ConflictException(message);
  }

  static duplicateResource(
    resource: string,
    identifier: string,
  ): ConflictException {
    const detail = `${resource} com identificador "${identifier}" já está cadastrado.`;
    return new ConflictException(detail);
  }
}
