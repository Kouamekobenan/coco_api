import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { QueueTicketStatus, QueueType, BookingStatus } from '@prisma/client';
import type { IQueueRepository } from '../../domain/repositories/queue.repository.interface.js';
import { QUEUE_REPOSITORY } from '../../domain/repositories/queue.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.interface.js';
import { CUSTOMER_REPOSITORY } from '../../../customer/domain/repositories/customer.repository.interface.js';
import type { IBookingRepository } from '../../../booking/domain/repositories/booking.repository.interface.js';
import { BOOKING_REPOSITORY } from '../../../booking/domain/repositories/booking.repository.interface.js';
import { QueueTicketEntity } from '../../domain/entities/queue-ticket.entity.js';
import { QueueWaitEstimate } from '../../domain/value-objects/queue-wait-estimate.vo.js';
import { CreateWalkInTicketDto } from '../dtos/create-walkin-ticket.dto.js';
import { CreateAppointmentTicketDto } from '../dtos/create-appointment-ticket.dto.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';
import { SalonCustomerNotFoundException } from '../../../customer/domain/exceptions/customer-domain.exception.js';
import { BookingNotFoundException } from '../../../booking/domain/exceptions/booking-domain.exception.js';
import { ActiveTicketAlreadyExistsException } from '../../domain/exceptions/queue-domain.exception.js';

@Injectable()
export class CreateTicketUseCase {
  constructor(
    @Inject(QUEUE_REPOSITORY)
    private readonly queueRepo: IQueueRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepo: ISalonRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepo: ICustomerRepository,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: IBookingRepository,
  ) {}

  public async createWalkInTicket(
    salonId: string,
    dto: CreateWalkInTicketDto,
  ): Promise<QueueTicketEntity> {
    const salon = await this.salonRepo.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const customer = await this.customerRepo.findById(dto.customerId);
    if (!customer || customer.getSalonId() !== salonId) {
      throw new SalonCustomerNotFoundException(dto.customerId);
    }

    // Vérifier si le client a déjà un ticket actif
    const existingActiveTicket = await this.queueRepo.findActiveByCustomer(salonId, dto.customerId);
    if (existingActiveTicket) {
      throw new ActiveTicketAlreadyExistsException(dto.customerId);
    }

    // Calcul de l'attente estimée dynamique si non fournie
    const activeQueue = await this.queueRepo.findActiveQueue(salonId);
    const waitingCount = activeQueue.filter((t) => t.status === QueueTicketStatus.WAITING).length;

    const minMinutes = dto.estimatedWaitMin ?? Math.max(0, waitingCount * 15);
    const maxMinutes = dto.estimatedWaitMax ?? Math.max(15, waitingCount * 25 + 15);
    const projectedStart = new Date(Date.now() + minMinutes * 60 * 1000);

    const estimate = new QueueWaitEstimate(minMinutes, maxMinutes, projectedStart);
    const ticketNumber = await this.queueRepo.getNextTicketNumber(
      salonId,
      QueueType.WALK_IN,
      new Date(),
    );

    const ticket = new QueueTicketEntity({
      id: randomUUID(),
      salonId,
      customerId: dto.customerId,
      bookingId: null,
      queueType: QueueType.WALK_IN,
      ticketNumber,
      status: QueueTicketStatus.WAITING,
      estimate,
      qrCodeToken: randomUUID(),
    });

    return await this.queueRepo.save(ticket);
  }

  public async createAppointmentTicket(
    salonId: string,
    dto: CreateAppointmentTicketDto,
  ): Promise<QueueTicketEntity> {
    const salon = await this.salonRepo.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const booking = await this.bookingRepo.findById(dto.bookingId);
    if (!booking || booking.salonId !== salonId) {
      throw new BookingNotFoundException(dto.bookingId);
    }

    // Idempotence: si un ticket existe déjà pour ce RDV, on le retourne
    const existingTicket = await this.queueRepo.findByBookingId(dto.bookingId);
    if (existingTicket) {
      return existingTicket;
    }

    // Si la réservation est CONFIRMED, on enregistre le check-in
    if (booking.status === BookingStatus.CONFIRMED) {
      booking.checkIn();
      await this.bookingRepo.update(booking);
    }

    // Pour un RDV à l'heure, l'attente estimée est minime (0 à 10 min)
    const estimate = new QueueWaitEstimate(0, 10, new Date());
    const ticketNumber = await this.queueRepo.getNextTicketNumber(
      salonId,
      QueueType.APPOINTMENT,
      new Date(),
    );

    const ticket = new QueueTicketEntity({
      id: randomUUID(),
      salonId,
      customerId: booking.customerId,
      bookingId: booking.id,
      queueType: QueueType.APPOINTMENT,
      ticketNumber,
      status: QueueTicketStatus.WAITING,
      estimate,
      qrCodeToken: randomUUID(),
    });

    return await this.queueRepo.save(ticket);
  }
}
