import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsString, IsEnum, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum TransactionTypeFilter {
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
  ADJUSTMENT = 'adjustment',
  DAMAGE = 'damage',
  RETURN = 'return',
}

export class FindTransactionsDto {
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

  @ApiProperty({ description: 'Filter by type', enum: TransactionTypeFilter, required: false })
  @IsOptional()
  @IsEnum(TransactionTypeFilter)
  type?: TransactionTypeFilter;

  @ApiProperty({ description: 'Filter by product ID', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  productId?: number;

  @ApiProperty({ description: 'Filter by start date', example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'Filter by end date', example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Filter by user ID', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;
}
