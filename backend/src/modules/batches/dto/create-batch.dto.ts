import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsDateString, IsOptional, IsPositive, Min } from 'class-validator';

export class CreateBatchDto {
  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsInt()
  productId: number;

  @ApiProperty({ description: 'Supplier ID', example: 1 })
  @IsInt()
  supplierId: number;

  @ApiProperty({ description: 'Quantity', example: 100 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ description: 'Unit ID', example: 1 })
  @IsInt()
  unitId: number;

  @ApiProperty({ description: 'Import date', example: '2024-01-01' })
  @IsDateString()
  importDate: string;

  @ApiProperty({ description: 'Expiry date', example: '2024-12-31', required: false })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiProperty({ description: 'Unit cost', example: 10.50 })
  @IsNumber()
  @IsPositive()
  unitCost: number;
}
