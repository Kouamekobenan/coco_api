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
import { ServiceDomainException } from '../../../service/domain/exceptions/service-domain.exception.js';
import { StaffDomainException } from '../../../staff/domain/exceptions/staff-domain.exception.js';
import { CustomerDomainException } from '../../../customer/domain/exceptions/customer-domain.exception.js';
import { BookingDomainException } from '../../../booking/domain/exceptions/booking-domain.exception.js';
import { QueueDomainException } from '../../../queue/domain/exceptions/queue-domain.exception.js';
import { PaymentDomainException } from '../../../payment/domain/exceptions/payment-domain.exception.js';

@Catch(
  DomainException,
  ServiceDomainException,
  StaffDomainException,
  CustomerDomainException,
  BookingDomainException,
  QueueDomainException,
  PaymentDomainException,
)
export class DomainExceptionFilter implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.BAD_REQUEST;

    if (exception instanceof InvalidCredentialsException) {
      status = HttpStatus.UNAUTHORIZED;
    } else if (
      exception instanceof UserAlreadyExistsException ||
      exception.name === 'SalonSlugAlreadyExistsException' ||
      exception.name === 'StyleSlugAlreadyExistsException' ||
      exception.name === 'SalonCustomerAlreadyExistsException' ||
      exception.name === 'BookingSlotUnavailableException' ||
      exception.name === 'BookingHoldExpiredException' ||
      exception.name === 'ActiveTicketAlreadyExistsException' ||
      exception.name === 'DuplicatePaymentException' ||
      exception.name === 'PaymentAlreadySettledException'
    ) {
      status = HttpStatus.CONFLICT;
    } else if (
      exception instanceof UserNotFoundException ||
      exception.name === 'SalonNotFoundException' ||
      exception.name === 'SalonMediaNotFoundException' ||
      exception.name === 'SalonPromotionNotFoundException' ||
      exception.name === 'SalonHourExceptionNotFoundException' ||
      exception.name === 'ServiceNotFoundException' ||
      exception.name === 'StyleNotFoundException' ||
      exception.name === 'ServiceVariantNotFoundException' ||
      exception.name === 'StaffNotFoundException' ||
      exception.name === 'StaffServiceNotFoundException' ||
      exception.name === 'StaffBreakNotFoundException' ||
      exception.name === 'StaffTimeOffNotFoundException' ||
      exception.name === 'ResourceNotFoundException' ||
      exception.name === 'SalonCustomerNotFoundException' ||
      exception.name === 'CustomerNoteNotFoundException' ||
      exception.name === 'BookingNotFoundException' ||
      exception.name === 'BookingPhaseNotFoundException' ||
      exception.name === 'QueueTicketNotFoundException' ||
      exception.name === 'PaymentNotFoundException'
    ) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception.name === 'UnauthorizedSalonAccessException') {
      status = HttpStatus.FORBIDDEN;
    } else if (
      exception instanceof InvalidPhoneNumberException ||
      exception instanceof InvalidPasswordException ||
      exception.name === 'InvalidSalonSlugException' ||
      exception.name === 'InvalidCoordinatesException' ||
      exception.name === 'InvalidSalonStatusTransitionException' ||
      exception.name === 'InvalidBookingStatusTransitionException' ||
      exception.name === 'InvalidQueueStatusTransitionException' ||
      exception.name === 'InvalidTicketNumberFormatException' ||
      exception.name === 'QueueCallExpiredException' ||
      exception.name === 'InvalidPaymentStatusTransitionException' ||
      exception.name === 'InvalidPaymentAmountException' ||
      exception.name === 'InsufficientLoyaltyPointsException' ||
      exception.name === 'InvalidServiceDurationsException' ||
      exception.name === 'InvalidServicePriceException' ||
      exception.name === 'InvalidWorkingHourException' ||
      exception.name === 'InvalidTimeOffRangeException'
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
