import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEmail, MaxLength } from 'class-validator';
import { Sanitize } from '../../../common/decorators/sanitize.decorator';

export class CreateSupplierDto {
  @ApiProperty({ description: 'Supplier name', example: 'ABC Supplies Ltd' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Sanitize()
  name: string;

  @ApiProperty({ description: 'Contact person', example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  contactPerson?: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ description: 'Email address', example: 'contact@abc.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Address', example: '123 Main St, City', required: false })
  @IsString()
  @IsOptional()
  address?: string;
}
