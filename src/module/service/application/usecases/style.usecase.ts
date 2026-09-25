import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { IStyleRepository } from '../../domain/repositories/style.repository.interface.js';
import { STYLE_REPOSITORY } from '../../domain/repositories/style.repository.interface.js';
import { CreateStyleDto, UpdateStyleDto } from '../dtos/create-style.dto.js';
import { StyleQueryDto } from '../dtos/style-query.dto.js';
import { StyleResponseDto } from '../dtos/style-response.dto.js';
import { StyleEntity } from '../../domain/entities/style.entity.js';
import { SalonSlug } from '../../../salon/domain/value-objects/salon-slug.vo.js';
import {
  StyleNotFoundException,
  StyleSlugAlreadyExistsException,
} from '../../domain/exceptions/service-domain.exception.js';
import { ServiceDtoMapper } from '../dtos/service-dto.mapper.js';

@Injectable()
export class CreateStyleUseCase {
  constructor(
    @Inject(STYLE_REPOSITORY)
    private readonly styleRepository: IStyleRepository,
  ) {}

  public async execute(dto: CreateStyleDto): Promise<StyleResponseDto> {
    const rawSlug = dto.slug && dto.slug.trim().length > 0 ? dto.slug : dto.name;
    const slug = SalonSlug.slugify(rawSlug);

    const exists = await this.styleRepository.existsBySlug(slug);
    if (exists) {
      throw new StyleSlugAlreadyExistsException(slug);
    }

    const style = StyleEntity.create({
      id: randomUUID(),
      name: dto.name,
      slug,
      universe: dto.universe,
      description: dto.description,
      imageUrl: dto.imageUrl,
    });

    await this.styleRepository.save(style);
    return ServiceDtoMapper.toStyleResponse(style);
  }
}

@Injectable()
export class GetStylesUseCase {
  constructor(
    @Inject(STYLE_REPOSITORY)
    private readonly styleRepository: IStyleRepository,
  ) {}

  public async execute(query: StyleQueryDto): Promise<{ data: StyleResponseDto[]; total: number }> {
    const { styles, total } = await this.styleRepository.findAll({
      universe: query.universe,
      isActive: query.isActive,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: styles.map((s) => ServiceDtoMapper.toStyleResponse(s)),
      total,
    };
  }
}

@Injectable()
export class GetStyleByIdUseCase {
  constructor(
    @Inject(STYLE_REPOSITORY)
    private readonly styleRepository: IStyleRepository,
  ) {}

  public async execute(id: string): Promise<StyleResponseDto> {
    const style = await this.styleRepository.findById(id);
    if (!style) {
      throw new StyleNotFoundException(id);
    }
    return ServiceDtoMapper.toStyleResponse(style);
  }
}

@Injectable()
export class GetStyleBySlugUseCase {
  constructor(
    @Inject(STYLE_REPOSITORY)
    private readonly styleRepository: IStyleRepository,
  ) {}

  public async execute(slug: string): Promise<StyleResponseDto> {
    const style = await this.styleRepository.findBySlug(slug);
    if (!style) {
      throw new StyleNotFoundException(slug);
    }
    return ServiceDtoMapper.toStyleResponse(style);
  }
}

@Injectable()
export class UpdateStyleUseCase {
  constructor(
    @Inject(STYLE_REPOSITORY)
    private readonly styleRepository: IStyleRepository,
  ) {}

  public async execute(id: string, dto: UpdateStyleDto): Promise<StyleResponseDto> {
    const style = await this.styleRepository.findById(id);
    if (!style) {
      throw new StyleNotFoundException(id);
    }

    style.update({
      name: dto.name,
      universe: dto.universe,
      description: dto.description,
      imageUrl: dto.imageUrl,
    });

    await this.styleRepository.update(style);
    return ServiceDtoMapper.toStyleResponse(style);
  }
}

@Injectable()
export class DeleteStyleUseCase {
  constructor(
    @Inject(STYLE_REPOSITORY)
    private readonly styleRepository: IStyleRepository,
  ) {}

  public async execute(id: string): Promise<{ success: boolean; message: string }> {
    const style = await this.styleRepository.findById(id);
    if (!style) {
      throw new StyleNotFoundException(id);
    }

    await this.styleRepository.delete(id);
    return {
      success: true,
      message: `Style "${style.getName()}" (${id}) supprimé avec succès.`,
    };
  }
}
