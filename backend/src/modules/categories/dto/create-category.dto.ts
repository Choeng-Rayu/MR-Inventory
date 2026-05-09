import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { Sanitize } from '../../../common/decorators/sanitize.decorator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Beverages' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Sanitize()
  name: string;

  @ApiProperty({ description: 'Category description', example: 'Drinks and beverages', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
