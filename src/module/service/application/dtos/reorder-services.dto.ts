import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsString, Min, ValidateNested } from 'class-validator';

export class ServiceOrderItemDto {
  @ApiProperty({ example: 'service-uuid-1' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderServicesDto {
  @ApiProperty({
    type: [ServiceOrderItemDto],
    description: 'Liste des IDs de services avec leur nouvel ordre',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceOrderItemDto)
  orders: ServiceOrderItemDto[];
}
