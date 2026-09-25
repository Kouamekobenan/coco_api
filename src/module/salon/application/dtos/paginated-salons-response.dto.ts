import { ApiProperty } from '@nestjs/swagger';
import { SalonResponseDto } from './salon-response.dto.js';

export class PaginatedSalonsResponseDto {
  @ApiProperty({ type: [SalonResponseDto] })
  data: SalonResponseDto[];

  @ApiProperty({ example: 48, description: 'Nombre total de résultats trouvés' })
  total: number;

  @ApiProperty({ example: 1, description: 'Page courante' })
  page: number;

  @ApiProperty({ example: 10, description: 'Éléments par page' })
  limit: number;

  @ApiProperty({ example: 5, description: 'Nombre total de pages' })
  totalPages: number;
}
