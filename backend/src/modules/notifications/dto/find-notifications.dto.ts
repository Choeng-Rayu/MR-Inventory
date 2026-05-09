import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsEnum, IsBoolean, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum NotificationTypeFilter {
  NEAR_EXPIRY = 'near_expiry',
  EXPIRED = 'expired',
  LOW_STOCK = 'low_stock',
  CHECK_IN = 'check_in',
  CHECK_OUT = 'check_out',
}

export class FindNotificationsDto {
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

  @ApiProperty({ description: 'Filter by type', enum: NotificationTypeFilter, required: false })
  @IsOptional()
  @IsEnum(NotificationTypeFilter)
  type?: NotificationTypeFilter;

  @ApiProperty({ description: 'Filter by read status', example: false, required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isRead?: boolean;
}
