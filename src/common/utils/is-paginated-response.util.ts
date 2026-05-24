import { PaginatedResponse } from '../interfaces/paginated-response.interface';

// o propósito dessa função é verificar se a resposta é do tipo PaginatedResponse, 
// o que é útil para o TransformInterceptor enriquecer a resposta com os campos de 
// timestamp e path, sem precisar de lógica específica para cada tipo de resposta.
export function isPaginatedResponse(
  data: unknown,
): data is PaginatedResponse<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    'meta' in data &&
        Array.isArray((data as { data?: unknown }).data) &&
        typeof (data as { meta?: unknown }).meta === 'object' &&
        (data as { meta?: unknown }).meta !== null &&
    'totalItems' in (data as { meta: Record<string, unknown> }).meta &&
    'page' in (data as { meta: Record<string, unknown> }).meta &&
    'limit' in (data as { meta: Record<string, unknown> }).meta &&
    'totalPages' in (data as { meta: Record<string, unknown> }).meta
  );
}