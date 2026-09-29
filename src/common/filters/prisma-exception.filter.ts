import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  public catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Une erreur de base de données est survenue.';
    let error = 'DatabaseError';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        error = 'ConflictException';
        const target = exception.meta?.target as string[] | string | undefined;
        const fields = Array.isArray(target) ? target.join(', ') : target ?? 'champ unique';
        message = `Un enregistrement avec ce ${fields} existe déjà.`;
        break;
      }
      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        error = 'NotFoundException';
        message = (exception.meta?.cause as string) || 'L’enregistrement demandé est introuvable.';
        break;
      }
      case 'P2003': {
        status = HttpStatus.BAD_REQUEST;
        error = 'BadRequestException';
        message = 'Opération impossible : une contrainte de clé étrangère n’est pas respectée.';
        break;
      }
      default: {
        this.logger.error(`Prisma error [${exception.code}]: ${exception.message}`, exception.stack);
        break;
      }
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
