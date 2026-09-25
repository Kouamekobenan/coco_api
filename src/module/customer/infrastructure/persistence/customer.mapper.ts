import {
  SalonCustomer as PrismaCustomer,
  CustomerNote as PrismaNote,
  CustomerSegment as PrismaSegment,
  Prisma,
} from '@prisma/client';
import { SalonCustomerEntity, CustomerSegmentType } from '../../domain/entities/salon-customer.entity.js';
import { CustomerNoteEntity } from '../../domain/entities/customer-note.entity.js';

type PrismaCustomerWithRelations = PrismaCustomer & {
  notes?: PrismaNote[];
};

export class CustomerMapper {
  public static toCustomerDomain(raw: PrismaCustomerWithRelations): SalonCustomerEntity {
    const customer = SalonCustomerEntity.reconstitute({
      id: raw.id,
      salonId: raw.salonId,
      userId: raw.userId,
      phone: raw.phone,
      name: raw.name,
      email: raw.email,
      segment: raw.segment as CustomerSegmentType,
      visitCount: raw.visitCount,
      totalSpent: raw.totalSpent.toNumber(),
      lastVisitAt: raw.lastVisitAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      notes: raw.notes ? raw.notes.map((n) => this.toNoteDomain(n)) : [],
    });

    return customer;
  }

  public static toCustomerPrismaCreate(customer: SalonCustomerEntity): Prisma.SalonCustomerUncheckedCreateInput {
    return {
      id: customer.getId(),
      salonId: customer.getSalonId(),
      userId: customer.getUserId(),
      phone: customer.getPhone(),
      name: customer.getName(),
      email: customer.getEmail(),
      segment: customer.getSegment() as PrismaSegment,
      visitCount: customer.getVisitCount(),
      totalSpent: new Prisma.Decimal(customer.getTotalSpent()),
      lastVisitAt: customer.getLastVisitAt(),
      createdAt: customer.getCreatedAt(),
      updatedAt: customer.getUpdatedAt(),
    };
  }

  public static toNoteDomain(raw: PrismaNote): CustomerNoteEntity {
    return CustomerNoteEntity.reconstitute({
      id: raw.id,
      salonId: raw.salonId,
      salonCustomerId: raw.salonCustomerId,
      authorId: raw.authorId,
      content: raw.content,
      isPrivate: raw.isPrivate,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  public static toNotePrismaCreate(note: CustomerNoteEntity): Prisma.CustomerNoteUncheckedCreateInput {
    return {
      id: note.getId(),
      salonId: note.getSalonId(),
      salonCustomerId: note.getSalonCustomerId(),
      authorId: note.getAuthorId(),
      content: note.getContent(),
      isPrivate: note.isPrivate(),
      createdAt: note.getCreatedAt(),
      updatedAt: note.getUpdatedAt(),
    };
  }
}
