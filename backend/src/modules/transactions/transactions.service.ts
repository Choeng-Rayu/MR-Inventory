import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Transaction } from '../../common/entities/transaction.entity';
import { FindTransactionsDto } from './dto/find-transactions.dto';
import { createPaginatedResult } from '../../common/utils/pagination.util';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async recordCheckIn(productId: number, batchId: number, quantity: number, unitId: number, userId: number) {
    const transaction = this.transactionRepository.create({
      type: 'check_in',
      productId,
      batchId,
      quantity,
      unitId,
      userId,
    });
    return this.transactionRepository.save(transaction);
  }

  async recordCheckOut(productId: number, batchId: number, quantity: number, unitId: number, userId: number) {
    const transaction = this.transactionRepository.create({
      type: 'check_out',
      productId,
      batchId,
      quantity,
      unitId,
      userId,
    });
    return this.transactionRepository.save(transaction);
  }

  async recordAdjustment(productId: number, batchId: number, quantity: number, unitId: number, userId: number, reason: string) {
    const transaction = this.transactionRepository.create({
      type: 'adjustment',
      productId,
      batchId,
      quantity,
      unitId,
      userId,
      reason,
    });
    return this.transactionRepository.save(transaction);
  }

  async findAll(dto: FindTransactionsDto) {
    const { page = 1, limit = 20, type, productId, startDate, endDate, userId } = dto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type;
    if (productId) where.productId = productId;
    if (userId) where.userId = userId;
    if (startDate && endDate) {
      where.timestamp = Between(new Date(startDate), new Date(endDate));
    }

    const [data, total] = await this.transactionRepository.findAndCount({
      where,
      relations: ['product', 'batch', 'user'],
      skip,
      take: limit,
      order: { timestamp: 'DESC' },
    });

    return createPaginatedResult(data, total, page, limit);
  }

  async findOne(id: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
      relations: ['product', 'batch', 'user'],
    });
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }
    return transaction;
  }

  async getRecentTransactions(limit: number = 10) {
    return this.transactionRepository.find({
      relations: ['product', 'batch', 'user'],
      take: limit,
      order: { timestamp: 'DESC' },
    });
  }
}
