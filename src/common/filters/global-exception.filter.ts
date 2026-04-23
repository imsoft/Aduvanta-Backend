import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;

    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorId = randomUUID();

    // Toda HttpException es una respuesta intencional (p.ej. terminus lanza
    // 503 cuando un downstream falla, `ForbiddenException` ante permisos,
    // etc.) y debemos preservar el cuerpo que el handler preparó. Solo
    // errores JS no controlados se convierten en 500 genérico con errorId
    // para evitar filtrar stack/PII/datos de esquema.
    const isClientError = status >= 400 && status < 500;
    const isUnhandledServerError = !isHttpException; // siempre 500 en este caso

    let responseBody: unknown;
    if (isHttpException) {
      const httpResponse = exception.getResponse();
      if (typeof httpResponse === 'object' && httpResponse !== null) {
        responseBody = {
          ...(httpResponse as Record<string, unknown>),
          statusCode: status,
          errorId,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      } else {
        responseBody = {
          statusCode: status,
          message: exception.message,
          errorId,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }
    } else {
      responseBody = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        errorId,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }

    if (isUnhandledServerError) {
      this.logger.error(
        {
          errorId,
          method: request.method,
          url: request.url,
          status,
          error:
            exception instanceof Error ? exception.message : String(exception),
          stack: exception instanceof Error ? exception.stack : undefined,
        },
        'Unhandled exception',
      );

      Sentry.withScope((scope) => {
        scope.setTag('errorId', errorId);
        scope.setContext('request', {
          method: request.method,
          url: request.url,
        });
        Sentry.captureException(exception);
      });
    } else if (!isClientError) {
      // HttpException 5xx (terminus, etc.): no escalamos a Sentry — ya son
      // errores intencionales y esperados. Solo log de nivel warn.
      this.logger.warn(
        {
          errorId,
          method: request.method,
          url: request.url,
          status,
          message: exception.message,
        },
        'HTTP exception',
      );
    }

    response.status(status).json(responseBody);
  }
}
