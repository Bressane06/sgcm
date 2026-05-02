import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ProblemDetailsDto } from '../dto/problem-details.dto';
import { AppException } from '../exceptions/app.exception';
import { ConflictException } from '../exceptions/conflict.exception';
import { ValidationException } from '../exceptions/validation.exception';
import {
  DatabaseDriverError,
  ValidationErrorItem,
  ValidationErrorResponse,
} from './http-exception.types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    
    // Identificadores únicos para rastreamento de erros
    const traceId = randomUUID();
    const timestamp = new Date().toISOString();

    let problemDetails: ProblemDetailsDto;

    if (exception instanceof ValidationException) {
      // Erros de validação customizados da aplicação
      problemDetails = this.handleValidationException(
        exception,
        request,
        traceId,
        timestamp,
      );
    } else if (exception instanceof AppException) {
      // Exceções de negócio/domínio da aplicação
      problemDetails = this.handleAppException(
        exception,
        request,
        traceId,
        timestamp,
      );
    } else if (exception instanceof QueryFailedError) {
      // Erros vindos diretamente do banco de dados (TypeORM)
      const conflictException = this.convertDatabaseErrorToException(exception);
      problemDetails = this.handleAppException(
        conflictException,
        request,
        traceId,
        timestamp,
      );
    } else if (exception instanceof BadRequestException) {
      // Erros de Bad Request nativos do NestJS (ex: ValidationPipe padrão)
      problemDetails = this.handleBadRequestException(
        exception,
        request,
        traceId,
        timestamp,
      );
    } else if (exception instanceof HttpException) {
      // Qualquer outra exceção HTTP padrão do NestJS
      problemDetails = this.handleHttpException(
        exception,
        request,
        traceId,
        timestamp,
      );
    } else {
      // Erros inesperados (Runtime errors, erros de sintaxe, etc.)
      problemDetails = this.handleUnexpectedException(
        exception,
        request,
        traceId,
        timestamp,
      );
    }

    // Registro do erro no log do servidor antes de enviar ao cliente
    this.logger.error(
      `[${traceId}] ${problemDetails.title}: ${problemDetails.detail}`,
      exception instanceof Error ? exception.stack : '',
    );

    // Envio da resposta formatada
    response.status(problemDetails.status).json(problemDetails);
  }

  /**
   * Converte erros específicos do driver do banco de dados (ex: SQLite) 
   * em exceções de negócio.
   */
  private convertDatabaseErrorToException(exception: QueryFailedError): AppException {
    const driverError = exception.driverError as DatabaseDriverError;

    // Tratamento específico para SQLite
    if (driverError?.code === 'SQLITE_CONSTRAINT') {
      
      // Erro de Unicidade (ex: Email já cadastrado)
      if (driverError?.message?.includes('UNIQUE constraint failed')) {
        let column = 'campo';
        const match = driverError.message.match(/UNIQUE constraint failed: (\w+)\.(\w+)/);
        if (match) {
          column = match[2] || column;
        } else {
          const parts = driverError.message.split(':');
          if (parts[1]) column = parts[1].trim().split('.').pop() || column;
        }

        // Não retornamos o valor exato aqui por segurança.
        return ConflictException.uniqueConstraint(column, 'já cadastrado');
      }

      // Erro de Chave Estrangeira
      if (driverError?.message?.includes('FOREIGN KEY constraint failed')) {
        return ConflictException.businessRule(
          'Violação de chave estrangeira',
          'O recurso referenciado não existe.',
        );
      }

      // Erro de Campo Obrigatório (NOT NULL)
      if (driverError?.message?.includes('NOT NULL constraint failed')) {
        const match = driverError.message.match(/NOT NULL constraint failed: (\w+)\.(\w+)/);
        if (match) {
          const [, , column] = match;
          return new AppException(
            'https://sgcm.example.com/problems/validation-error',
            'Erro de validação',
            400,
            `Campo obrigatório não foi preenchido: ${column}`,
          );
        }
      }

      return ConflictException.businessRule(
        'Conflito de dados',
        'Houve um conflito ao tentar processar os dados.',
      );
    }

    return new AppException(
      'https://sgcm.example.com/problems/database-error',
      'Erro de banco de dados',
      400,
      'Erro ao processar dados no banco de dados.',
    );
  }

  /**
   * Formata exceções customizadas da aplicação (AppException)
   */
  private handleAppException(
    exception: AppException,
    request: Request,
    traceId: string,
    timestamp: string,
  ): ProblemDetailsDto {
    return {
      type: exception.type,
      title: exception.title,
      status: exception.status,
      detail: exception.detail,
      instance: exception.instance || request.path,
      method: request.method,
      timestamp,
      traceId,
    };
  }

  /**
   * Formata exceções de validação, incluindo a lista de campos inválidos
   */
  private handleValidationException(
    exception: ValidationException,
    request: Request,
    traceId: string,
    timestamp: string,
  ): ProblemDetailsDto {
    const hasErrors = !!exception.errors && Object.keys(exception.errors).length > 0;

    return {
      type: exception.type,
      title: exception.title,
      status: exception.status,
      detail: exception.detail,
      instance: exception.instance || request.path,
      method: request.method,
      timestamp,
      traceId,
      ...(hasErrors ? { errors: exception.errors } : {}),
    };
  }

  /**
   * Trata o BadRequestException do Nest, disparado pelo ValidationPipe
   */
  private handleBadRequestException(
    exception: BadRequestException,
    request: Request,
    traceId: string,
    timestamp: string,
  ): ProblemDetailsDto {
    const errorResponse = exception.getResponse() as ValidationErrorResponse;
    const errors = this.extractValidationErrors(errorResponse);
    const hasErrors = Object.keys(errors).length > 0;

    return {
      type: 'https://sgcm.example.com/problems/validation-error',
      title: 'Erro de validação',
      status: HttpStatus.BAD_REQUEST,
      detail: 'Um ou mais campos contêm valores inválidos. Verifique os detalhes.',
      instance: request.path,
      method: request.method,
      timestamp,
      traceId,
      ...(hasErrors ? { errors } : {}),
    };
  }

  /**
   * Mapeia exceções HTTP genéricas para títulos e tipos amigáveis
   */
  private handleHttpException(
    exception: HttpException,
    request: Request,
    traceId: string,
    timestamp: string,
  ): ProblemDetailsDto {
    const status = exception.getStatus();
    const errorResponse = exception.getResponse() as ValidationErrorResponse | string;

    let title = 'Erro na requisição';
    let type = 'https://sgcm.example.com/problems/http-error';

    switch (status) {
      case HttpStatus.NOT_FOUND:
        title = 'Recurso não encontrado';
        type = 'https://sgcm.example.com/problems/not-found';
        break;
      case HttpStatus.UNAUTHORIZED:
        title = 'Não autorizado';
        type = 'https://sgcm.example.com/problems/unauthorized';
        break;
      case HttpStatus.FORBIDDEN:
        title = 'Acesso proibido';
        type = 'https://sgcm.example.com/problems/forbidden';
        break;
      case HttpStatus.CONFLICT:
        title = 'Conflito';
        type = 'https://sgcm.example.com/problems/conflict';
        break;
    }

    return {
      type,
      title,
      status,
      detail:
        typeof errorResponse === 'string'
          ? errorResponse
          : (typeof errorResponse.message === 'string'
              ? errorResponse.message
              : exception.message),
      instance: request.path,
      method: request.method,
      timestamp,
      traceId,
    };
  }

  /**
   * 500 Internal Server Error
   */
  private handleUnexpectedException(
    exception: unknown,
    request: Request,
    traceId: string,
    timestamp: string,
  ): ProblemDetailsDto {
    this.logger.error(
      `[${traceId}] Erro inesperado:`,
      exception instanceof Error ? exception.stack : exception,
    );

    return {
      type: 'https://sgcm.example.com/problems/internal-server-error',
      title: 'Erro interno do servidor',
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      detail: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.',
      instance: request.path,
      method: request.method,
      timestamp,
      traceId,
    };
  }

  /**
   * Utilitário para extrair mensagens de erro de validação do formato do Nest
   * e transformar em um dicionário Record<string, string[]>
   */
  private extractValidationErrors(
    errorResponse: ValidationErrorResponse,
  ): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    if (Array.isArray(errorResponse.message)) {
      errorResponse.message.forEach((error: ValidationErrorItem) => {
        // Trata o formato de erro retornado pelo class-validator
        if (error.property && error.constraints) {
          errors[error.property] = Object.values(error.constraints);
        }
      });
    }

    return errors;
  }
}