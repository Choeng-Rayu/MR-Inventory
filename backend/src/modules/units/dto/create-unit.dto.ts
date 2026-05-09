import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ description: 'Unit name', example: 'box' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  unitName: string;

  @ApiProperty({ description: 'Conversion rate to base unit', example: 12.0 })
  @IsNumber()
  @Min(0.0001)
  conversionRate: number;

  @ApiProperty({ description: 'Is this the base unit', example: false, required: false })
  @IsBoolean()
  @IsOptional()
  isBaseUnit?: boolean;
}
