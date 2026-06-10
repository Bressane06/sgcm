import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

export const ACCESS_TOKEN_BEARER_SCHEME = 'access-token';

type SwaggerPropertySchema = {
  type: string;
  example?: unknown;
  properties?: Record<string, SwaggerPropertySchema>;
  items?: SwaggerPropertySchema;
  $ref?: string;
};

interface ApiWrappedResponseOptions {
  status?: HttpStatus;
  description: string;
  model?: Type<unknown>;
  isArray?: boolean;
  example?: unknown;
  metaProperties?: Record<string, SwaggerPropertySchema>;
  metaExample?: Record<string, unknown>;
}

interface ApiAuthResponsesOptions {
  instance: string;
  unauthorizedDetail: string;
  forbiddenDetail?: string;
  unauthorizedDescription?: string;
  forbiddenDescription?: string;
  includeForbidden?: boolean;
}

export function ApiWrappedResponse(options: ApiWrappedResponseOptions) {
  const decorators: Array<MethodDecorator & ClassDecorator> = [];

  if (options.model) {
    decorators.push(ApiExtraModels(options.model));
  }

  const dataSchema = options.model
    ? options.isArray
      ? { type: 'array', items: { $ref: getSchemaPath(options.model) } }
      : { $ref: getSchemaPath(options.model) }
    : options.isArray
      ? {
          type: 'array',
          items:
            options.example !== undefined
              ? { example: options.example }
              : { type: 'object' },
        }
      : options.example !== undefined
        ? { example: options.example }
        : { type: 'object' };

  const metaProperties = options.metaProperties ?? {
    timestamp: { type: 'string', example: '2026-05-24T09:00:00.000Z' },
    path: { type: 'string', example: '/example' },
  };

  const metaExample = options.metaExample ?? {
    timestamp: '2026-05-24T09:00:00.000Z',
    path: '/example',
  };

  decorators.push(
    ApiResponse({
      status: options.status ?? HttpStatus.OK,
      description: options.description,
      schema: {
        type: 'object',
        properties: {
          data: dataSchema,
          meta: {
            type: 'object',
            properties: metaProperties,
            example: metaExample,
          },
        },
      },
    }),
  );

  return applyDecorators(...decorators);
}

export function ApiAuthResponses(options: ApiAuthResponsesOptions) {
  const decorators: Array<MethodDecorator & ClassDecorator> = [
    ApiBearerAuth(ACCESS_TOKEN_BEARER_SCHEME),
    ApiUnauthorizedResponse({
      description:
        options.unauthorizedDescription ??
        'Token ausente, inválido ou expirado.',
      schema: {
        example: {
          type: 'https://sgcm.example.com/problems/unauthorized',
          title: 'Não autenticado',
          status: 401,
          detail: options.unauthorizedDetail,
          instance: options.instance,
        },
      },
    }),
  ];

  if (options.includeForbidden !== false) {
    decorators.push(
      ApiForbiddenResponse({
        description:
          options.forbiddenDescription ??
          'Perfil sem permissão para este endpoint.',
        schema: {
          example: {
            type: 'https://sgcm.example.com/problems/forbidden',
            title: 'Acesso negado',
            status: 403,
            detail:
              options.forbiddenDetail ??
              'Seu perfil não tem permissão para realizar esta operação.',
            instance: options.instance,
          },
        },
      }),
    );
  }

  return applyDecorators(...decorators);
}
