import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class TelegramAuthDto {
  @ApiProperty({ description: 'Telegram user ID', example: 123456789 })
  @IsNumber()
  id: number;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({ description: 'Last name', example: 'Doe', required: false })
  @IsString()
  @IsOptional()
  last_name?: string;

  @ApiProperty({ description: 'Username', example: 'johndoe', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ description: 'Photo URL', example: 'https://t.me/i/userpic/...', required: false })
  @IsString()
  @IsOptional()
  photo_url?: string;

  @ApiProperty({ description: 'Auth timestamp', example: 1699900000 })
  @IsNumber()
  auth_date: number;

  @ApiProperty({ description: 'HMAC hash for verification', example: 'abc123...' })
  @IsString()
  @IsNotEmpty()
  hash: string;
}
