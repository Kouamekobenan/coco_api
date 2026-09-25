import { ResourceEntity, ResourceType } from '../entities/resource.entity.js';

export const RESOURCE_REPOSITORY = Symbol('RESOURCE_REPOSITORY');

export interface ResourceFilterOptions {
  type?: ResourceType;
  isActive?: boolean;
}

export interface IResourceRepository {
  save(resource: ResourceEntity): Promise<void>;
  findById(id: string): Promise<ResourceEntity | null>;
  findBySalonId(salonId: string, options?: ResourceFilterOptions): Promise<ResourceEntity[]>;
  update(resource: ResourceEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
