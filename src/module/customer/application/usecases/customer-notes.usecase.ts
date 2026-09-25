import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface.js';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface.js';
import {
  CreateCustomerNoteDto,
  CustomerNoteResponseDto,
  UpdateCustomerNoteDto,
} from '../dtos/create-customer-note.dto.js';
import { CustomerNoteEntity } from '../../domain/entities/customer-note.entity.js';
import {
  CustomerNoteNotFoundException,
  SalonCustomerNotFoundException,
} from '../../domain/exceptions/customer-domain.exception.js';
import { CustomerDtoMapper } from '../dtos/customer-dto.mapper.js';

@Injectable()
export class AddCustomerNoteUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  public async execute(
    salonId: string,
    customerId: string,
    authorId: string,
    dto: CreateCustomerNoteDto,
  ): Promise<CustomerNoteResponseDto> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer || customer.getSalonId() !== salonId) {
      throw new SalonCustomerNotFoundException(customerId);
    }

    const note = CustomerNoteEntity.create({
      id: randomUUID(),
      salonId,
      salonCustomerId: customerId,
      authorId,
      content: dto.content,
      isPrivate: dto.isPrivate,
    });

    await this.customerRepository.saveNote(note);
    return CustomerDtoMapper.toNoteResponse(note);
  }
}

@Injectable()
export class GetCustomerNotesUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  public async execute(salonId: string, customerId: string): Promise<CustomerNoteResponseDto[]> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer || customer.getSalonId() !== salonId) {
      throw new SalonCustomerNotFoundException(customerId);
    }

    const notes = await this.customerRepository.findNotesByCustomerId(customerId);
    return notes.map((n) => CustomerDtoMapper.toNoteResponse(n));
  }
}

@Injectable()
export class UpdateCustomerNoteUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  public async execute(
    salonId: string,
    customerId: string,
    noteId: string,
    dto: UpdateCustomerNoteDto,
  ): Promise<CustomerNoteResponseDto> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer || customer.getSalonId() !== salonId) {
      throw new SalonCustomerNotFoundException(customerId);
    }

    const note = await this.customerRepository.findNoteById(noteId);
    if (!note || note.getSalonCustomerId() !== customerId) {
      throw new CustomerNoteNotFoundException(noteId);
    }

    note.update(dto.content, dto.isPrivate);
    await this.customerRepository.updateNote(note);
    return CustomerDtoMapper.toNoteResponse(note);
  }
}

@Injectable()
export class DeleteCustomerNoteUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  public async execute(
    salonId: string,
    customerId: string,
    noteId: string,
  ): Promise<{ success: boolean; message: string }> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer || customer.getSalonId() !== salonId) {
      throw new SalonCustomerNotFoundException(customerId);
    }

    const note = await this.customerRepository.findNoteById(noteId);
    if (!note || note.getSalonCustomerId() !== customerId) {
      throw new CustomerNoteNotFoundException(noteId);
    }

    await this.customerRepository.deleteNote(noteId);
    return {
      success: true,
      message: `Note technique (${noteId}) supprimée avec succès.`,
    };
  }
}
