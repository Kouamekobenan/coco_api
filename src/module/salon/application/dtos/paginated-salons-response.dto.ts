import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../../common/dtos/paginated-response.dto.js';
import { SalonResponseDto } from './salon-response.dto.js';

export class PaginatedSalonsResponseDto extends PaginatedResponseDto<SalonResponseDto> {
  @ApiProperty({ type: [SalonResponseDto] })
  declare data: SalonResponseDto[];
}
