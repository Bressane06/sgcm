import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { isPaginatedResponse } from '../utils/is-paginated-response.util';
import { SKIP_TRANSFORM_KEY } from '../decorators/skip-transform.decorator';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const skipTransform = this.reflector.getAllAndOverride<boolean>(
      SKIP_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipTransform) {
      return next.handle();
    }

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

        if (isPaginatedResponse(data)) {
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
