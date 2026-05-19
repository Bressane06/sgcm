import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const httpContext = context.switchToHttp();
        const response = httpContext.getResponse<Response>();
        const request = httpContext.getRequest<Request>();

        // Não transformar respostas sem corpo (204, null, undefined)
        if (
          response.statusCode === 204 ||
          data === null ||
          data === undefined
        ) {
          return data;
        }

        const timestamp = new Date().toISOString();
        const path = request.path;

        // Detectar se já é uma resposta paginada pela estrutura
        // (tem data como array e meta com campos de paginação)
        if (
          data &&
          typeof data === 'object' &&
          Array.isArray(data.data) &&
          data.meta &&
          typeof data.meta === 'object' &&
          'totalItems' in data.meta &&
          'page' in data.meta &&
          'limit' in data.meta &&
          'totalPages' in data.meta
        ) {
          // Enriquecer meta existente com timestamp e path
          return {
            data: data.data,
            meta: {
              ...data.meta,
              timestamp,
              path,
            },
          };
        }

        // Envolver resposta simples no envelope padrão
        return {
          data,
          meta: {
            timestamp,
            path,
          },
        };
      }),
    );
  }
}
