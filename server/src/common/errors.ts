import {
  HttpException,
  HttpStatus,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';

export class AppError extends HttpException {
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    code: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: unknown,
  ) {
    super({ code, message, details }, status);
    this.code = code;
    this.details = details;
  }
}

export { AppError as AppHttpException };

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof AppError) {
      const status = exception.getStatus();
      response.status(status).json({
        code: exception.code,
        message: exception.message,
        details: exception.details ?? null,
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details ?? null,
        },
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : (res as any)?.message || exception.message;
      const code = (res as any)?.code || `HTTP_${status}`;
      response.status(status).json({
        code,
        message: Array.isArray(message) ? message.join('; ') : String(message),
      });
      return;
    }

    const err = exception as Error;
    console.error('[UnhandledServerException]', err?.stack || err);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Đã có lỗi máy chủ xảy ra. Vui lòng thử lại.',
    });
  }
}
