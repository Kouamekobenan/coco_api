import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseRepository } from '../types/response-respository.js';

export class PaginatedResponseDto<T> implements PaginatedResponseRepository<T> {
  data!: T[];

  @ApiProperty({ example: 42, description: 'Nombre total d’éléments' })
  total!: number;

  @ApiProperty({ example: 5, description: 'Nombre total de pages' })
  totalPages!: number;

  @ApiProperty({ example: 1, description: 'Page actuelle' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Limite d’éléments par page' })
  limit!: number;

  public static create<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponseDto<T> {
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      data,
      total,
      totalPages,
      page,
      limit,
    };
  }
}
