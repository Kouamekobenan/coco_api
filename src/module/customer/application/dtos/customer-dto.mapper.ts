import { SalonCustomerEntity } from '../../domain/entities/salon-customer.entity.js';
import { CustomerResponseDto } from './customer-response.dto.js';
import { CustomerNoteEntity } from '../../domain/entities/customer-note.entity.js';
import { CustomerNoteResponseDto } from './create-customer-note.dto.js';

export class CustomerDtoMapper {
  public static toCustomerResponse(customer: SalonCustomerEntity): CustomerResponseDto {
    return {
      id: customer.getId(),
      salonId: customer.getSalonId(),
      userId: customer.getUserId(),
      phone: customer.getPhone(),
      name: customer.getName(),
      email: customer.getEmail(),
      segment: customer.getSegment(),
      visitCount: customer.getVisitCount(),
      totalSpent: customer.getTotalSpent(),
      lastVisitAt: customer.getLastVisitAt(),
      createdAt: customer.getCreatedAt(),
      updatedAt: customer.getUpdatedAt(),
    };
  }

  public static toNoteResponse(note: CustomerNoteEntity): CustomerNoteResponseDto {
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
