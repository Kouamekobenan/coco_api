import { SalonCustomerEntity, CustomerSegmentType } from '../entities/salon-customer.entity.js';
import { CustomerNoteEntity } from '../entities/customer-note.entity.js';

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerFilterOptions {
  segment?: CustomerSegmentType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ICustomerRepository {
  // SalonCustomer
  save(customer: SalonCustomerEntity): Promise<void>;
  findById(id: string): Promise<SalonCustomerEntity | null>;
  findByPhone(salonId: string, phone: string): Promise<SalonCustomerEntity | null>;
  findByUserId(salonId: string, userId: string): Promise<SalonCustomerEntity | null>;
  findAll(
    salonId: string,
    options: CustomerFilterOptions,
  ): Promise<{ customers: SalonCustomerEntity[]; total: number }>;
  update(customer: SalonCustomerEntity): Promise<void>;
  delete(id: string): Promise<void>;

  // CustomerNote
  saveNote(note: CustomerNoteEntity): Promise<void>;
  findNoteById(noteId: string): Promise<CustomerNoteEntity | null>;
  findNotesByCustomerId(salonCustomerId: string): Promise<CustomerNoteEntity[]>;
  updateNote(note: CustomerNoteEntity): Promise<void>;
  deleteNote(noteId: string): Promise<void>;
}
