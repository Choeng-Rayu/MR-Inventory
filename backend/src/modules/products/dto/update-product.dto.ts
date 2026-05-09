import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsNumber, Min, MaxLength } from 'class-validator';
import { Sanitize } from '../../../common/decorators/sanitize.decorator';

export class UpdateProductDto {
  @ApiProperty({ description: 'Product name', example: 'Coca Cola 330ml', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Sanitize()
  name?: string;

  @ApiProperty({ description: 'Product SKU', example: 'PROD-001', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  sku?: string;

  @ApiProperty({ description: 'Product barcode', example: '1234567890123', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  barcode?: string;

  @ApiProperty({ description: 'Category ID', example: 1, required: false })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ description: 'Base unit of measurement', example: 'piece', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  baseUnit?: string;

  @ApiProperty({ description: 'Product description', example: 'Soft drink 330ml can', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Low stock threshold', example: 10, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  lowStockThreshold?: number;
}
