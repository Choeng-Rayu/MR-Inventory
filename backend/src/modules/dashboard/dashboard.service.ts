import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, Between } from 'typeorm';
import { Product } from '../../common/entities/product.entity';
import { Batch } from '../../common/entities/batch.entity';
import { Transaction } from '../../common/entities/transaction.entity';
import { SettingsService } from '../settings/settings.service';
import { DashboardMetricsDto, LowStockDto } from './dto/dashboard-metrics.dto';

@Injectable()
export class DashboardService {
  private metricsCache: { data: DashboardMetricsDto; timestamp: number } | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private settingsService: SettingsService,
  ) {}

  async getMetrics(): Promise<DashboardMetricsDto> {
    const now = Date.now();
    if (this.metricsCache && now - this.metricsCache.timestamp < this.CACHE_TTL) {
      return this.metricsCache.data;
    }

    const metrics = await this.calculateMetrics();
    this.metricsCache = { data: metrics, timestamp: now };
    return metrics;
  }

  private async calculateMetrics(): Promise<DashboardMetricsDto> {
    const [totalInventoryValue, totalProducts, lowStockCount, nearExpiryCount, expiredCount, recentTransactions] =
      await Promise.all([
        this.calculateTotalInventoryValue(),
        this.productRepository.count(),
        this.countLowStock(),
        this.countNearExpiry(),
        this.countExpired(),
        this.transactionRepository.find({
          relations: ['product', 'batch'],
          take: 10,
          order: { timestamp: 'DESC' },
        }),
      ]);

    return {
      totalInventoryValue,
      totalProducts,
      lowStockCount,
      nearExpiryCount,
      expiredCount,
      recentTransactions,
    };
  }

  private async calculateTotalInventoryValue(): Promise<number> {
    const result = await this.batchRepository
      .createQueryBuilder('batch')
      .select('COALESCE(SUM(batch.quantity * batch.unit_cost), 0)', 'total')
      .where('batch.is_depleted = false')
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  private async countLowStock(): Promise<number> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.batches', 'batch', 'batch.is_depleted = false')
      .select('product.id', 'productId')
      .addSelect('product.low_stock_threshold', 'threshold')
      .addSelect('COALESCE(SUM(batch.quantity), 0)', 'currentQuantity')
      .groupBy('product.id')
      .having('currentQuantity < threshold')
      .getRawMany();

    return result.length;
  }

  private async countNearExpiry(): Promise<number> {
    const threshold = parseInt(await this.settingsService.getValue('near_expiry_threshold') || '30');
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + threshold);

    return this.batchRepository.count({
      where: {
        expiryDate: Between(new Date(), thresholdDate),
        isDepleted: false,
      },
    });
  }

  private async countExpired(): Promise<number> {
    return this.batchRepository.count({
      where: {
        expiryDate: LessThan(new Date()),
        isDepleted: false,
      },
    });
  }

  async getLowStockProducts(): Promise<LowStockDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.batches', 'batch', 'batch.is_depleted = false')
      .select('product.id', 'id')
      .addSelect('product.name', 'name')
      .addSelect('product.low_stock_threshold', 'lowStockThreshold')
      .addSelect('COALESCE(SUM(batch.quantity), 0)', 'currentStock')
      .groupBy('product.id')
      .having('currentStock < lowStockThreshold')
      .orderBy('currentStock', 'ASC')
      .getRawMany();

    return products.map(p => ({
      id: String(p.id),
      name: p.name,
      currentStock: parseFloat(p.currentStock) || 0,
      lowStockThreshold: parseFloat(p.lowStockThreshold) || 0,
    }));
  }
}
