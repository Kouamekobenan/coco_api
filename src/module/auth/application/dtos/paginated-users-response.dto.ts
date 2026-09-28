import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../../../common/dtos/paginated-response.dto.js';
import { UserResponseDto } from './user-response.dto.js';

export class PaginatedUsersResponseDto extends PaginatedResponseDto<UserResponseDto> {
  @ApiProperty({ type: () => [UserResponseDto] })
  declare data: UserResponseDto[];
}
