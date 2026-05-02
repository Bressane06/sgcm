import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProblemDetailsDto } from '../dto/problem-details.dto';
import { AppException } from '../exceptions/app.exception';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    // Isso gerar um ID único para cada erro, facilitando o rastreamento nos logs.
    const traceId = uuidv4();
    const timestamp = new Date().toISOString();

    let problemDetails: ProblemDetailsDto;

    if (exception instanceof AppException) {
      problemDetails = this.handleAppException(
        exception,
        request,
        traceId,
        timestamp,
      );
    } else if (exception instanceof BadRequestException) {
      problemDetails = this.handleValidationError(
        exception,
        request,
        traceId,
        timestamp,
      );
    } else if (exception instanceof HttpException) {
      problemDetails = this.handleHttpException(
        exception,
        request,
        traceId,
        timestamp,
      );
    } else {
      problemDetails = this.handleUnexpectedException(
        exception,
        request,
        traceId,
        timestamp,
      );
    }

    this.logger.error(
      `[${traceId}] ${problemDetails.title}: ${problemDetails.detail}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(problemDetails.status).json(problemDetails);
  }

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

  private handleValidationError(
    exception: BadRequestException,
    request: Request,
    traceId: string,
    timestamp: string,
  ): ProblemDetailsDto {
    const errorResponse: any = exception.getResponse();

    return {
      type: 'https://sgcm.example.com/problems/validation-error',
      title: 'Erro de validação',
      status: HttpStatus.BAD_REQUEST,
      detail:
        'Um ou mais campos contêm valores inválidos. Verifique os detalhes.',
      instance: request.path,
      method: request.method,
      timestamp,
      traceId,
      errors: this.extractValidationErrors(errorResponse),
    };
  }

  private handleHttpException(
    exception: HttpException,
    request: Request,
    traceId: string,
    timestamp: string,
  ): ProblemDetailsDto {
    const status = exception.getStatus();
    const errorResponse: any = exception.getResponse();

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
          : errorResponse.message || exception.message,
      instance: request.path,
      method: request.method,
      timestamp,
      traceId,
    };
  }

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
      detail:
        'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.',
      instance: request.path,
      method: request.method,
      timestamp,
      traceId,
    };
  }

  private extractValidationErrors(
    errorResponse: any,
  ): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    if (Array.isArray(errorResponse.message)) {
      errorResponse.message.forEach((error: any) => {
        if (error.property && error.constraints) {
          errors[error.property] = Object.values(error.constraints) as string[];
        }
      });
    }

    return errors;
  }
}
