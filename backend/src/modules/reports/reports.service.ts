import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
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

    const productMap = new Map();
    for (const batch of filtered) {
      const pid = batch.productId;
      if (!productMap.has(pid)) {
        productMap.set(pid, {
          productId: String(pid),
          productName: batch.product?.name || 'Unknown',
          category: batch.product?.category?.name || 'Uncategorized',
          totalQuantity: 0,
          unit: batch.product?.baseUnit || 'unit',
          value: 0,
        });
      }
      const item = productMap.get(pid);
      item.totalQuantity += Number(batch.quantity);
      item.value += Number(batch.quantity) * Number(batch.unitCost);
    }

    const data = Array.from(productMap.values());
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    return { data, totalValue };
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
    const expired: any[] = [];
    const nearExpiry7d: any[] = [];
    const nearExpiry30d: any[] = [];
    const nearExpiry90d: any[] = [];

    for (const batch of batches) {
      if (!batch.expiryDate) continue;
      const days = Math.ceil((batch.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      const item = {
        batchCode: batch.batchCode,
        productName: batch.product?.name || 'Unknown',
        supplier: batch.supplier?.name || 'Unknown',
        quantity: Number(batch.quantity),
        expiryDate: batch.expiryDate.toISOString(),
        daysUntilExpiry: days,
      };

      if (days < 0) expired.push(item);
      else if (days <= 7) nearExpiry7d.push(item);
      else if (days <= 30) nearExpiry30d.push(item);
      else if (days <= 90) nearExpiry90d.push(item);
    }

    const totalValue = batches.reduce((sum, b) => sum + (Number(b.quantity) * Number(b.unitCost)), 0);

    return { expired, nearExpiry7d, nearExpiry30d, nearExpiry90d, totalValue };
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
          supplierId: String(sid),
          supplierName: batch.supplier?.name || 'Unknown',
          totalBatches: 0,
          totalQuantity: 0,
          totalValue: 0,
        };
      }
      acc[sid].totalBatches++;
      acc[sid].totalQuantity += Number(batch.quantity);
      acc[sid].totalValue += Number(batch.quantity) * Number(batch.unitCost);
      return acc;
    }, {});

    const data: any[] = Object.values(grouped);
    const grandTotalValue = data.reduce((sum, item: any) => sum + item.totalValue, 0);

    for (const item of data) {
      item.percentageOfTotal = grandTotalValue > 0 ? (item.totalValue / grandTotalValue) * 100 : 0;
    }

    return { data };
  }

  async generateStockMovementReport(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate && endDate) {
      where.timestamp = Between(startDate, endDate);
    }

    const transactions = await this.transactionRepository.find({
      where,
      relations: ['product'],
      order: { timestamp: 'DESC' },
    });

    const productMap = new Map();
    let totalCheckIn = 0;
    let totalCheckOut = 0;

    for (const tx of transactions) {
      const pid = tx.productId;
      if (!productMap.has(pid)) {
        productMap.set(pid, {
          productId: String(pid),
          productName: tx.product?.name || 'Unknown',
          checkInQuantity: 0,
          checkOutQuantity: 0,
          netChange: 0,
        });
      }
      const item = productMap.get(pid);
      if (tx.type === 'check_in') {
        item.checkInQuantity += Number(tx.quantity);
        totalCheckIn += Number(tx.quantity);
      } else if (tx.type === 'check_out') {
        item.checkOutQuantity += Number(tx.quantity);
        totalCheckOut += Number(tx.quantity);
      }
    }

    const data = Array.from(productMap.values()).map(item => ({
      ...item,
      netChange: item.checkInQuantity - item.checkOutQuantity,
    }));

    return { data, totalCheckIn, totalCheckOut };
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
