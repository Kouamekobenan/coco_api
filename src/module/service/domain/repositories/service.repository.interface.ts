import { ServiceEntity } from '../entities/service.entity.js';
import { ServiceVariantEntity } from '../entities/service-variant.entity.js';

export const SERVICE_REPOSITORY = Symbol('SERVICE_REPOSITORY');

export interface IServiceRepository {
  // Service
  save(service: ServiceEntity): Promise<void>;
  findById(id: string): Promise<ServiceEntity | null>;
  findBySalonId(salonId: string, onlyActive?: boolean): Promise<ServiceEntity[]>;
  update(service: ServiceEntity): Promise<void>;
  delete(id: string): Promise<void>;
  updateSortOrders(salonId: string, orders: Array<{ id: string; sortOrder: number }>): Promise<void>;

  // Variantes
  saveVariant(variant: ServiceVariantEntity): Promise<void>;
  findVariantById(variantId: string): Promise<ServiceVariantEntity | null>;
  findVariantsByServiceId(serviceId: string, onlyActive?: boolean): Promise<ServiceVariantEntity[]>;
  updateVariant(variant: ServiceVariantEntity): Promise<void>;
  deleteVariant(variantId: string): Promise<void>;
}
