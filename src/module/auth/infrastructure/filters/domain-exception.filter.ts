import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  DomainException,
  InvalidCredentialsException,
  InvalidPasswordException,
  InvalidPhoneNumberException,
  UserAlreadyExistsException,
  UserNotFoundException,
} from '../../domain/exceptions/domain.exception.js';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  public catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;

    if (exception instanceof InvalidCredentialsException) {
      status = HttpStatus.UNAUTHORIZED;
    } else if (exception instanceof UserAlreadyExistsException) {
      status = HttpStatus.CONFLICT;
    } else if (exception instanceof UserNotFoundException) {
      status = HttpStatus.NOT_FOUND;
    } else if (
      exception instanceof InvalidPhoneNumberException ||
      exception instanceof InvalidPasswordException
    ) {
      status = HttpStatus.BAD_REQUEST;
    }

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
