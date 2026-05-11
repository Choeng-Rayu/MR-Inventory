import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsDateString, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindBatchesDto {
  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', example: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({ description: 'Filter by product ID', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productId?: number;

  @ApiProperty({ description: 'Filter by supplier ID', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  supplierId?: number;

  @ApiProperty({ description: 'Filter by expiry date from', example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  expiryFrom?: string;

  @ApiProperty({ description: 'Filter by expiry date to', example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  expiryTo?: string;

  @ApiProperty({ description: 'Filter by import date from', example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  importFrom?: string;

  @ApiProperty({ description: 'Filter by import date to', example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  importTo?: string;

  @ApiProperty({ description: 'Filter by expiry status', example: 'all', required: false })
  @IsOptional()
  @IsString()
  expiryStatus?: string;
}
