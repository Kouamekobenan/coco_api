import { Injectable } from '@nestjs/common';
import { AppUniverse as PrismaAppUniverse, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import {
  IStyleRepository,
  StyleFilterOptions,
} from '../../domain/repositories/style.repository.interface.js';
import { StyleEntity } from '../../domain/entities/style.entity.js';
import { StyleMapper } from './style.mapper.js';

@Injectable()
export class PrismaStyleRepository implements IStyleRepository {
  constructor(private readonly prisma: PrismaService) {}

  public async save(style: StyleEntity): Promise<void> {
    const data = StyleMapper.toPrismaCreate(style);
    await this.prisma.style.create({ data });
  }

  public async findById(id: string): Promise<StyleEntity | null> {
    const raw = await this.prisma.style.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return StyleMapper.toDomain(raw);
  }

  public async findBySlug(slug: string): Promise<StyleEntity | null> {
    const raw = await this.prisma.style.findUnique({
      where: { slug },
    });
    if (!raw) return null;
    return StyleMapper.toDomain(raw);
  }

  public async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.StyleWhereInput = { slug };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await this.prisma.style.count({ where });
    return count > 0;
  }

  public async findAll(options: StyleFilterOptions): Promise<{ styles: StyleEntity[]; total: number }> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.StyleWhereInput = {};

    if (options.universe) {
      where.universe = options.universe as PrismaAppUniverse;
    }

    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    if (options.search) {
      const term = options.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, rawStyles] = await Promise.all([
      this.prisma.style.count({ where }),
      this.prisma.style.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
    ]);

    const styles = rawStyles.map((s) => StyleMapper.toDomain(s));
    return { styles, total };
  }

  public async update(style: StyleEntity): Promise<void> {
    await this.prisma.style.update({
      where: { id: style.getId() },
      data: {
        name: style.getName(),
        slug: style.getSlug(),
        universe: style.getUniverse() as PrismaAppUniverse,
        description: style.getDescription(),
        imageUrl: style.getImageUrl(),
        isActive: style.isActive(),
        updatedAt: style.getUpdatedAt(),
      },
    });
  }

  public async delete(id: string): Promise<void> {
    await this.prisma.style.delete({
      where: { id },
    });
  }
}
