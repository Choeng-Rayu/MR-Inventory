import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsPositive } from 'class-validator';

export class CheckOutDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'Quantity', example: 50 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'Unit ID', example: 1 })
  @IsInt()
  unitId: number;
}
