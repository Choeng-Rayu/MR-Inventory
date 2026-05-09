import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDateString, IsOptional, IsPositive, IsBoolean } from 'class-validator';

export class UpdateBatchDto {
  @ApiProperty({ description: 'Quantity', example: 100, required: false })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  quantity?: number;

  @ApiProperty({ description: 'Expiry date', example: '2024-12-31', required: false })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiProperty({ description: 'Unit cost', example: 10.50, required: false })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  unitCost?: number;

  @ApiProperty({ description: 'Is depleted', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isDepleted?: boolean;
}
