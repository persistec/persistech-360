import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resContent = exception.getResponse();
      if (typeof resContent === 'object' && resContent !== null) {
        const nestRes = resContent as Record<string, unknown>;
        const errorVal = nestRes['error'];
        const messageVal = nestRes['message'];

        error =
          typeof errorVal === 'string' ? errorVal : exception.name || 'Error';

        if (Array.isArray(messageVal)) {
          message = messageVal.map((item) => String(item)).join(', ');
        } else {
          message =
            typeof messageVal === 'string' ? messageVal : exception.message;
        }
      } else if (typeof resContent === 'string') {
        message = resContent;
        error = exception.name || 'HttpException';
      } else {
        message = exception.message;
        error = exception.name || 'HttpException';
      }
    } else if (exception instanceof Error) {
      const isProduction = process.env.NODE_ENV === 'production';
      message = isProduction
        ? 'An unexpected error occurred'
        : exception.message;
      error = exception.name || 'Error';
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
