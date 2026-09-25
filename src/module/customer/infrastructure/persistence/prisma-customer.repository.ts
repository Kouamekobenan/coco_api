import { Injectable } from '@nestjs/common';
import { CustomerSegment as PrismaSegment, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import {
  CustomerFilterOptions,
  ICustomerRepository,
} from '../../domain/repositories/customer.repository.interface.js';
import { SalonCustomerEntity } from '../../domain/entities/salon-customer.entity.js';
import { CustomerNoteEntity } from '../../domain/entities/customer-note.entity.js';
import { CustomerMapper } from './customer.mapper.js';

@Injectable()
export class PrismaCustomerRepository implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async save(customer: SalonCustomerEntity): Promise<void> {
    const data = CustomerMapper.toCustomerPrismaCreate(customer);
    await this.prisma.salonCustomer.create({ data });
  }

  public async findById(id: string): Promise<SalonCustomerEntity | null> {
    const raw = await this.prisma.salonCustomer.findUnique({
      where: { id },
      include: {
        notes: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!raw) return null;
    return CustomerMapper.toCustomerDomain(raw);
  }

  public async findByPhone(salonId: string, phone: string): Promise<SalonCustomerEntity | null> {
    const raw = await this.prisma.salonCustomer.findUnique({
      where: {
        salonId_phone: { salonId, phone },
      },
      include: {
        notes: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!raw) return null;
    return CustomerMapper.toCustomerDomain(raw);
  }

  public async findByUserId(salonId: string, userId: string): Promise<SalonCustomerEntity | null> {
    const raw = await this.prisma.salonCustomer.findFirst({
      where: { salonId, userId },
      include: {
        notes: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!raw) return null;
    return CustomerMapper.toCustomerDomain(raw);
  }

  public async findAll(
    salonId: string,
    options: CustomerFilterOptions,
  ): Promise<{ customers: SalonCustomerEntity[]; total: number }> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.SalonCustomerWhereInput = { salonId };

    if (options.segment) {
      where.segment = options.segment as PrismaSegment;
    }

    if (options.search) {
      const term = options.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, rawCustomers] = await Promise.all([
      this.prisma.salonCustomer.count({ where }),
      this.prisma.salonCustomer.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ lastVisitAt: 'desc' }, { createdAt: 'desc' }],
      }),
    ]);

    const customers = rawCustomers.map((c) => CustomerMapper.toCustomerDomain(c));
    return { customers, total };
  }

  public async update(customer: SalonCustomerEntity): Promise<void> {
    await this.prisma.salonCustomer.update({
      where: { id: customer.getId() },
      data: {
        userId: customer.getUserId(),
        name: customer.getName(),
        phone: customer.getPhone(),
        email: customer.getEmail(),
        segment: customer.getSegment() as PrismaSegment,
        visitCount: customer.getVisitCount(),
        totalSpent: new Prisma.Decimal(customer.getTotalSpent()),
        lastVisitAt: customer.getLastVisitAt(),
        updatedAt: customer.getUpdatedAt(),
      },
    });
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.salonCustomer.delete({
      where: { id },
    });
  }

  // CustomerNote
  public async saveNote(note: CustomerNoteEntity): Promise<void> {
    const data = CustomerMapper.toNotePrismaCreate(note);
    await this.prisma.customerNote.create({ data });
  }

  public async findNoteById(noteId: string): Promise<CustomerNoteEntity | null> {
    const raw = await this.prisma.customerNote.findUnique({
      where: { id: noteId },
    });
    if (!raw) return null;
    return CustomerMapper.toNoteDomain(raw);
  }

  public async findNotesByCustomerId(salonCustomerId: string): Promise<CustomerNoteEntity[]> {
    const raw = await this.prisma.customerNote.findMany({
      where: { salonCustomerId },
      orderBy: { createdAt: 'desc' },
    });
    return raw.map((n) => CustomerMapper.toNoteDomain(n));
  }

  public async updateNote(note: CustomerNoteEntity): Promise<void> {
    await this.prisma.customerNote.update({
      where: { id: note.getId() },
      data: {
        content: note.getContent(),
        isPrivate: note.isPrivate(),
        updatedAt: note.getUpdatedAt(),
      },
    });
  }

  public async deleteNote(noteId: string): Promise<void> {
    await this.prisma.customerNote.delete({
      where: { id: noteId },
    });
  }
}
