import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class AdjustmentDto {
  @ApiProperty({ description: 'Batch ID', example: 1 })
  @IsInt()
  batchId: number;

  @ApiProperty({ description: 'Adjustment quantity (positive or negative)', example: -5 })
  @IsNumber()
  adjustmentQuantity: number;

  @ApiProperty({ description: 'Unit ID', example: 1 })
  @IsInt()
  unitId: number;

  @ApiProperty({ description: 'Reason for adjustment', example: 'Damaged items' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
