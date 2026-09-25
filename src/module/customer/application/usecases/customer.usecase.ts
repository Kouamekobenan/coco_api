import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { ICustomerRepository } from '../../domain/repositories/customer.repository.interface.js';
import { CUSTOMER_REPOSITORY } from '../../domain/repositories/customer.repository.interface.js';
import type { ISalonRepository } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { SALON_REPOSITORY } from '../../../salon/domain/repositories/salon.repository.interface.js';
import { CreateCustomerDto, UpdateCustomerDto } from '../dtos/create-customer.dto.js';
import { CustomerQueryDto } from '../dtos/customer-query.dto.js';
import { CustomerResponseDto, PaginatedCustomersResponseDto } from '../dtos/customer-response.dto.js';
import { SalonCustomerEntity } from '../../domain/entities/salon-customer.entity.js';
import { SalonNotFoundException } from '../../../salon/domain/exceptions/salon-domain.exception.js';
import {
  SalonCustomerAlreadyExistsException,
  SalonCustomerNotFoundException,
} from '../../domain/exceptions/customer-domain.exception.js';
import { CustomerDtoMapper } from '../dtos/customer-dto.mapper.js';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(salonId: string, dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const existing = await this.customerRepository.findByPhone(salonId, dto.phone);
    if (existing) {
      throw new SalonCustomerAlreadyExistsException(dto.phone);
    }

    const customer = SalonCustomerEntity.create({
      id: randomUUID(),
      salonId,
      userId: dto.userId,
      phone: dto.phone,
      name: dto.name,
      email: dto.email,
      segment: dto.segment,
    });

    await this.customerRepository.save(customer);
    return CustomerDtoMapper.toCustomerResponse(customer);
  }
}

@Injectable()
export class FindOrCreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  public async execute(data: {
    salonId: string;
    phone: string;
    name: string;
    email?: string | null;
    userId?: string | null;
  }): Promise<SalonCustomerEntity> {
    let customer = await this.customerRepository.findByPhone(data.salonId, data.phone);
    if (!customer) {
      customer = SalonCustomerEntity.create({
        id: randomUUID(),
        salonId: data.salonId,
        phone: data.phone,
        name: data.name,
        email: data.email,
        userId: data.userId,
      });
      await this.customerRepository.save(customer);
    } else if (data.userId && !customer.getUserId()) {
      customer.linkUser(data.userId);
      await this.customerRepository.update(customer);
    }

    return customer;
  }
}

@Injectable()
export class GetSalonCustomersUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
    @Inject(SALON_REPOSITORY)
    private readonly salonRepository: ISalonRepository,
  ) {}

  public async execute(
    salonId: string,
    query: CustomerQueryDto,
  ): Promise<PaginatedCustomersResponseDto> {
    const salon = await this.salonRepository.findById(salonId);
    if (!salon) {
      throw new SalonNotFoundException(salonId);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const { customers, total } = await this.customerRepository.findAll(salonId, {
      segment: query.segment,
      search: query.search,
      page,
      limit,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: customers.map((c) => CustomerDtoMapper.toCustomerResponse(c)),
      total,
      page,
      limit,
      totalPages,
    };
  }
}

@Injectable()
export class GetCustomerByIdUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  public async execute(salonId: string, customerId: string): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer || customer.getSalonId() !== salonId) {
      throw new SalonCustomerNotFoundException(customerId);
    }

    return CustomerDtoMapper.toCustomerResponse(customer);
  }
}

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  public async execute(
    salonId: string,
    customerId: string,
    dto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer || customer.getSalonId() !== salonId) {
      throw new SalonCustomerNotFoundException(customerId);
    }

    customer.updateProfile({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
    });

    if (dto.segment) {
      customer.changeSegment(dto.segment);
    }

    await this.customerRepository.update(customer);
    return CustomerDtoMapper.toCustomerResponse(customer);
  }
}

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  public async execute(salonId: string, customerId: string): Promise<{ success: boolean; message: string }> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer || customer.getSalonId() !== salonId) {
      throw new SalonCustomerNotFoundException(customerId);
    }

    await this.customerRepository.delete(customerId);
    return {
      success: true,
      message: `Fiche client "${customer.getName()}" (${customerId}) supprimée avec succès.`,
    };
  }
}
