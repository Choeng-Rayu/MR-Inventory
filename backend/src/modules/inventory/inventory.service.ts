import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Batch } from '../../common/entities/batch.entity';
import { Transaction } from '../../common/entities/transaction.entity';
import { UnitConverterService } from '../units/units.service';
import { BatchesService } from '../batches/batches.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AdjustmentDto } from './dto/adjustment.dto';
import { InsufficientStockException } from '../../common/exceptions/business.exceptions';

@Injectable()
export class CheckInService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private batchesService: BatchesService,
    private unitConverterService: UnitConverterService,
    private dataSource: DataSource,
  ) {}

  async checkIn(dto: CheckInDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Convert quantity to base unit
      const baseQuantity = await this.unitConverterService.convertToBaseUnit(dto.quantity, dto.unitId);

      // Create batch
      const batch = await this.batchesService.create(dto, baseQuantity);

      // Record transaction
      const transaction = queryRunner.manager.create(Transaction, {
        type: 'check_in',
        productId: dto.productId,
        batchId: batch.id,
        quantity: baseQuantity,
        unitId: dto.unitId,
        userId,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return { batch, transaction };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

@Injectable()
export class CheckOutService {
  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private unitConverterService: UnitConverterService,
    private dataSource: DataSource,
  ) {}

  async checkOut(dto: CheckOutDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Convert quantity to base unit
      const baseQuantity = await this.unitConverterService.convertToBaseUnit(dto.quantity, dto.unitId);

      // Get non-depleted batches ordered by import date (FIFO)
      const batches = await queryRunner.manager.find(Batch, {
        where: { productId: dto.productId, isDepleted: false },
        order: { importDate: 'ASC' },
      });

      // Calculate total available
      const totalAvailable = batches.reduce((sum, b) => sum + Number(b.quantity), 0);
      if (totalAvailable < baseQuantity) {
        throw new InsufficientStockException(totalAvailable, baseQuantity);
      }

      // Deduct from batches using FIFO
      let remainingToDeduct = baseQuantity;
      const deductions: { batchId: number; batchCode: string; quantityDeducted: number }[] = [];
      const transactions: Transaction[] = [];

      for (const batch of batches) {
        if (remainingToDeduct <= 0) break;

        const deductAmount = Math.min(Number(batch.quantity), remainingToDeduct);
        batch.quantity = Number(batch.quantity) - deductAmount;

        if (batch.quantity === 0) {
          batch.isDepleted = true;
        }

        await queryRunner.manager.save(batch);

        const transaction = queryRunner.manager.create(Transaction, {
          type: 'check_out',
          productId: dto.productId,
          batchId: batch.id,
          quantity: deductAmount,
          unitId: dto.unitId,
          userId,
        });
        await queryRunner.manager.save(transaction);

        deductions.push({
          batchId: batch.id,
          batchCode: batch.batchCode,
          quantityDeducted: deductAmount,
        });
        transactions.push(transaction);

        remainingToDeduct -= deductAmount;
      }

      await queryRunner.commitTransaction();
      return { deductions, transactions };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

@Injectable()
export class AdjustmentService {
  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private unitConverterService: UnitConverterService,
    private dataSource: DataSource,
  ) {}

  async adjust(dto: AdjustmentDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const batch = await queryRunner.manager.findOne(Batch, { where: { id: dto.batchId } });
      if (!batch) {
        throw new Error('Batch not found');
      }

      const baseAdjustment = await this.unitConverterService.convertToBaseUnit(
        Math.abs(dto.adjustmentQuantity),
        dto.unitId,
      );
      const signedAdjustment = dto.adjustmentQuantity < 0 ? -baseAdjustment : baseAdjustment;
      const newQuantity = Number(batch.quantity) + signedAdjustment;

      if (newQuantity < 0) {
        throw new Error('Adjustment would result in negative quantity');
      }

      batch.quantity = newQuantity;
      batch.isDepleted = newQuantity === 0;
      await queryRunner.manager.save(batch);

      const transaction = queryRunner.manager.create(Transaction, {
        type: 'adjustment',
        productId: batch.productId,
        batchId: batch.id,
        quantity: signedAdjustment,
        unitId: dto.unitId,
        userId,
        reason: dto.reason,
      });
      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      return { batch, transaction };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
