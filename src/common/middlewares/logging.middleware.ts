import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(request: Request, response: Response, next: NextFunction): void {
    const startedAt = Date.now();
    const timestamp = new Date().toISOString();
    const url = request.originalUrl;
    const method = request.method;
    let logWritten = false;

    // finish -> resposta enviada com sucesso (ex: cliente recebeu a resposta)
    // close -> conexão fechada antes da resposta ser enviada (ex: cliente desconectou)

    // isso foi implementado para garantir que mesmo em casos de desconexão do cliente,
    // o log seja registrado, indicando que a resposta não foi concluída.
    const writeLog = (event: 'finish' | 'close'): void => {
      if (logWritten) {
        return;
      }

      logWritten = true;

      const durationMs = Date.now() - startedAt;
      const statusCode = response.statusCode;
      const ip = request.ip || request.socket.remoteAddress || 'unknown';

      const logEntry = {
        timestamp,
        method,
        url,
        ip,
        statusCode,
        durationMs,
        event,
        completed: event === 'finish',
      };

      this.logger.log(JSON.stringify(logEntry, null, 2));
    };

    response.on('finish', () => writeLog('finish'));
    response.on('close', () => writeLog('close'));

    next();
  }
}
