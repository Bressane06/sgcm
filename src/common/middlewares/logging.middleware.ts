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

    response.on('finish', () => {
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
      };

      this.logger.log(JSON.stringify(logEntry, null, 2));
    });

    next();
  }
}