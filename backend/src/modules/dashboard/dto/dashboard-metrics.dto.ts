import { ApiProperty } from '@nestjs/swagger';

export class DashboardMetricsDto {
  @ApiProperty({ description: 'Total inventory value', example: 125000.50 })
  totalInventoryValue: number;

  @ApiProperty({ description: 'Total products', example: 150 })
  totalProducts: number;

  @ApiProperty({ description: 'Low stock count', example: 12 })
  lowStockCount: number;

  @ApiProperty({ description: 'Near expiry count', example: 8 })
  nearExpiryCount: number;

  @ApiProperty({ description: 'Expired count', example: 3 })
  expiredCount: number;

  @ApiProperty({ description: 'Recent transactions' })
  recentTransactions: any[];
}

export class LowStockDto {
  @ApiProperty({ description: 'Product ID', example: '1' })
  id: string;

  @ApiProperty({ description: 'Product name', example: 'Coca Cola 330ml' })
  name: string;

  @ApiProperty({ description: 'Current stock quantity', example: 5 })
  currentStock: number;

  @ApiProperty({ description: 'Low stock threshold', example: 10 })
  lowStockThreshold: number;
}
