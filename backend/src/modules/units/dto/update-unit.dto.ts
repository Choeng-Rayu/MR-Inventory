import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';

export class UpdateUnitDto {
  @ApiProperty({ description: 'Unit name', example: 'box', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  unitName?: string;

  @ApiProperty({ description: 'Conversion rate to base unit', example: 12.0, required: false })
  @IsNumber()
  @Min(0.0001)
  @IsOptional()
  conversionRate?: number;

  @ApiProperty({ description: 'Is this the base unit', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isBaseUnit?: boolean;
}
