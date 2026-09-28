import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../../common/dtos/paginated-response.dto.js';
import { StyleResponseDto } from './style-response.dto.js';

export class PaginatedStylesResponseDto extends PaginatedResponseDto<StyleResponseDto> {
  @ApiProperty({ type: () => [StyleResponseDto] })
  declare data: StyleResponseDto[];
}
