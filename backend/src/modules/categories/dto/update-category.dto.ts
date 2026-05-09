import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { Sanitize } from '../../../common/decorators/sanitize.decorator';

export class UpdateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Beverages', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  @Sanitize()
  name?: string;

  @ApiProperty({ description: 'Category description', example: 'Drinks and beverages', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
