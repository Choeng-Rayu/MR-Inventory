import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any)['message'];
      details = (exceptionResponse as any)['details'];
    } else if (exception.code === 'ER_DUP_ENTRY') {
      status = HttpStatus.CONFLICT;
      message = 'Duplicate entry';
    }

    // REQ-7: Log errors with stack trace
    this.logger.error(
      `${request.method} ${request.url}`,
      exception.stack,
      'GlobalExceptionFilter',
    );

    const errorResponse: any = {
      statusCode: status,
      message,
      error: HttpStatus[status],
      timestamp: new Date().toISOString(),
      path: request.url,
    };
    if (details) {
      errorResponse.details = details;
    }
    response.status(status).json(errorResponse);
  }
}
