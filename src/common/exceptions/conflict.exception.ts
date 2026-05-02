import { AppException } from './app.exception';

export class ConflictException extends AppException {
  constructor(detail: string) {
    super(
      'https://sgcm.example.com/problems/conflict',
      'Conflito',
      409,
      detail,
    );
    this.name = 'ConflictException';
  }
}
