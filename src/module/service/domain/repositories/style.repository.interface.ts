import { StyleEntity, AppUniverseType } from '../entities/style.entity.js';

export const STYLE_REPOSITORY = Symbol('STYLE_REPOSITORY');

export interface StyleFilterOptions {
  universe?: AppUniverseType;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IStyleRepository {
  save(style: StyleEntity): Promise<void>;
  findById(id: string): Promise<StyleEntity | null>;
  findBySlug(slug: string): Promise<StyleEntity | null>;
  existsBySlug(slug: string, excludeId?: string): Promise<boolean>;
  findAll(options: StyleFilterOptions): Promise<{ styles: StyleEntity[]; total: number }>;
  update(style: StyleEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
