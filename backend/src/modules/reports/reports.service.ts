import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Product } from '../../common/entities/product.entity';
import { Batch } from '../../common/entities/batch.entity';
import { Supplier } from '../../common/entities/supplier.entity';
import { Transaction } from '../../common/entities/transaction.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async generateInventoryReport(categoryId?: number, supplierId?: number, startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (startDate && endDate) where.importDate = Between(startDate, endDate);

    const batches = await this.batchRepository.find({
      where,
      relations: ['product', 'product.category', 'supplier'],
      order: { productId: 'ASC', importDate: 'DESC' },
    });

    const filtered = categoryId
      ? batches.filter(b => b.product?.categoryId === categoryId)
      : batches;

    const grouped = filtered.reduce((acc, batch) => {
      const catName = batch.product?.category?.name || 'Uncategorized';
      if (!acc[catName]) {
        acc[catName] = { batches: [], totalValue: 0, totalQuantity: 0 };
      }
      acc[catName].batches.push(batch);
      acc[catName].totalValue += Number(batch.quantity) * Number(batch.unitCost);
      acc[catName].totalQuantity += Number(batch.quantity);
      return acc;
    }, {});

    const totalValue = filtered.reduce((sum, b) => sum + (Number(b.quantity) * Number(b.unitCost)), 0);

    return { grouped, totalValue, totalBatches: filtered.length };
  }

  async generateExpiryReport(startDate?: Date, endDate?: Date) {
    const where: any = { isDepleted: false };
    if (startDate && endDate) where.expiryDate = Between(startDate, endDate);

    const batches = await this.batchRepository.find({
      where,
      relations: ['product', 'supplier'],
      order: { expiryDate: 'ASC' },
    });

    const now = new Date();
    const groups = {
      expired: [] as typeof batches,
      within7Days: [] as typeof batches,
      within30Days: [] as typeof batches,
      within90Days: [] as typeof batches,
    };

    for (const batch of batches) {
      if (!batch.expiryDate) continue;
      const days = Math.ceil((batch.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (days < 0) groups.expired.push(batch);
      else if (days <= 7) groups.within7Days.push(batch);
      else if (days <= 30) groups.within30Days.push(batch);
      else if (days <= 90) groups.within90Days.push(batch);
    }

    const calculateValue = (batches: typeof groups.expired) =>
      batches.reduce((sum, b) => sum + (Number(b.quantity) * Number(b.unitCost)), 0);

    return {
      expired: { batches: groups.expired, totalValue: calculateValue(groups.expired) },
      within7Days: { batches: groups.within7Days, totalValue: calculateValue(groups.within7Days) },
      within30Days: { batches: groups.within30Days, totalValue: calculateValue(groups.within30Days) },
      within90Days: { batches: groups.within90Days, totalValue: calculateValue(groups.within90Days) },
    };
  }

  async generateSupplierPerformanceReport(supplierId?: number, startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (startDate && endDate) where.importDate = Between(startDate, endDate);

    const batches = await this.batchRepository.find({
      where,
      relations: ['supplier', 'product'],
      order: { importDate: 'DESC' },
    });

    const grouped = batches.reduce((acc, batch) => {
      const sid = batch.supplierId;
      if (!acc[sid]) {
        acc[sid] = {
          supplier: batch.supplier,
          batches: [],
          totalQuantity: 0,
          totalValue: 0,
          expiredCount: 0,
        };
      }
      acc[sid].batches.push(batch);
      acc[sid].totalQuantity += Number(batch.quantity);
      acc[sid].totalValue += Number(batch.quantity) * Number(batch.unitCost);
      if (batch.expiryDate && batch.expiryDate < new Date()) {
        acc[sid].expiredCount++;
      }
      return acc;
    }, {});

    return Object.values(grouped);
  }

  convertToCsv(data: any[], headers: string[]): string {
    const rows = data.map(row =>
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
      }).join(','),
    );
    return [headers.join(','), ...rows].join('\n');
  }
}
