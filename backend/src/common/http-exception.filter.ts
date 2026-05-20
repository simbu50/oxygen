import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request & { traceId?: string }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        message = (body as { message?: string | string[] }).message ?? message;
        error = (body as { error?: string }).error ?? exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    if (status >= 500) {
      this.logger.error(`[${req.traceId}] ${req.method} ${req.url} ${status}`, exception as Error);
    } else {
      this.logger.warn(`[${req.traceId}] ${req.method} ${req.url} ${status} - ${JSON.stringify(message)}`);
    }

    res.status(status).json({
      statusCode: status,
      error,
      message,
      traceId: req.traceId,
      timestamp: new Date().toISOString(),
    });
  }
}
