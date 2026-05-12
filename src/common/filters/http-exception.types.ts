// Isso foi criado para evitar dependências circulares entre os arquivos de exceção e os tipos de resposta de erro.
export interface DatabaseDriverError {
  code?: string;
  message?: string;
}

export interface ValidationErrorItem {
  property?: string;
  constraints?: Record<string, string>;
}

export interface ValidationErrorResponse {
  message?: ValidationErrorItem[] | string;
  error?: string;
}
