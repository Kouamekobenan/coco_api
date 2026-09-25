import { Inject, Injectable } from '@nestjs/common';
import { QueueTicketStatus, QueueType, BookingStatus } from '@prisma/client';
import type { IQueueRepository } from '../../domain/repositories/queue.repository.interface.js';
import { QUEUE_REPOSITORY } from '../../domain/repositories/queue.repository.interface.js';
import type { IBookingRepository } from '../../../booking/domain/repositories/booking.repository.interface.js';
import { BOOKING_REPOSITORY } from '../../../booking/domain/repositories/booking.repository.interface.js';
import type { ICustomerRepository } from '../../../customer/domain/repositories/customer.repository.interface.js';
import { CUSTOMER_REPOSITORY } from '../../../customer/domain/repositories/customer.repository.interface.js';
import { QueueTicketEntity } from '../../domain/entities/queue-ticket.entity.js';
import {
  QueueTicketNotFoundException,
} from '../../domain/exceptions/queue-domain.exception.js';

@Injectable()
export class QueueLifecycleUseCase {
  constructor(
    @Inject(QUEUE_REPOSITORY)
    private readonly queueRepo: IQueueRepository,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepo: IBookingRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepo: ICustomerRepository,
  ) {}

  private async getTicketOrThrow(salonId: string, ticketId: string): Promise<QueueTicketEntity> {
    const ticket = await this.queueRepo.findById(ticketId);
    if (!ticket || ticket.salonId !== salonId) {
      throw new QueueTicketNotFoundException(ticketId);
    }
    return ticket;
  }

  public async callNext(salonId: string, graceMinutes = 10): Promise<QueueTicketEntity | null> {
    const activeQueue = await this.queueRepo.findActiveQueue(salonId);
    const waitingTickets = activeQueue.filter((t) => t.status === QueueTicketStatus.WAITING);

    if (waitingTickets.length === 0) {
      return null;
    }

    // Algorithme d'ordonnancement hybride:
    // 1. Les RDVs confirmés dont l'heure de début est passée ou imminente ont la priorité absolue
    // 2. Ensuite les clients selon l'ordre d'arrivée au salon (createdAt ascendant)
    const sorted = [...waitingTickets].sort((a, b) => {
      if (a.queueType === QueueType.APPOINTMENT && b.queueType !== QueueType.APPOINTMENT) {
        return -1;
      }
      if (b.queueType === QueueType.APPOINTMENT && a.queueType !== QueueType.APPOINTMENT) {
        return 1;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    const nextTicket = sorted[0];
    nextTicket.call(graceMinutes);
    return await this.queueRepo.update(nextTicket);
  }

  public async callTicket(
    salonId: string,
    ticketId: string,
    graceMinutes = 10,
  ): Promise<QueueTicketEntity> {
    const ticket = await this.getTicketOrThrow(salonId, ticketId);
    ticket.call(graceMinutes);
    return await this.queueRepo.update(ticket);
  }

  public async startService(salonId: string, ticketId: string): Promise<QueueTicketEntity> {
    const ticket = await this.getTicketOrThrow(salonId, ticketId);
    ticket.startService();
    const updatedTicket = await this.queueRepo.update(ticket);

    // Synchronisation avec la réservation si liée
    if (ticket.bookingId) {
      const booking = await this.bookingRepo.findById(ticket.bookingId);
      if (
        booking &&
        (booking.status === BookingStatus.CHECKED_IN ||
          booking.status === BookingStatus.CONFIRMED)
      ) {
        booking.start();
        await this.bookingRepo.update(booking);
      }
    }

    return updatedTicket;
  }

  public async completeTicket(salonId: string, ticketId: string): Promise<QueueTicketEntity> {
    const ticket = await this.getTicketOrThrow(salonId, ticketId);
    ticket.complete();
    const updatedTicket = await this.queueRepo.update(ticket);

    // Synchronisation avec la réservation et CRM si liée
    if (ticket.bookingId) {
      const booking = await this.bookingRepo.findById(ticket.bookingId);
      if (booking && booking.status === BookingStatus.IN_PROGRESS) {
        booking.complete();
        await this.bookingRepo.update(booking);

        // CRM: Enregistrement automatique de la visite
        try {
          const customer = await this.customerRepo.findById(booking.customerId);
          if (customer) {
            customer.recordVisit(booking.totalPrice);
            await this.customerRepo.update(customer);
          }
        } catch {
          // Ignorer l'erreur CRM secondaire
        }
      }
    }

    return updatedTicket;
  }

  public async markLeft(salonId: string, ticketId: string): Promise<QueueTicketEntity> {
    const ticket = await this.getTicketOrThrow(salonId, ticketId);
    ticket.markLeft();
    return await this.queueRepo.update(ticket);
  }

  public async markNoShow(salonId: string, ticketId: string): Promise<QueueTicketEntity> {
    const ticket = await this.getTicketOrThrow(salonId, ticketId);
    ticket.markNoShow();
    const updatedTicket = await this.queueRepo.update(ticket);

    // Synchronisation avec la réservation
    if (ticket.bookingId) {
      const booking = await this.bookingRepo.findById(ticket.bookingId);
      if (booking) {
        booking.markNoShow();
        await this.bookingRepo.update(booking);
      }
    }

    return updatedTicket;
  }
}
