import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, Like } from 'typeorm';
import { format } from 'date-fns';
import { Batch } from '../../common/entities/batch.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { FindBatchesDto } from './dto/find-batches.dto';
import { createPaginatedResult } from '../../common/utils/pagination.util';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
  ) {}

  async generateBatchCode(importDate: Date): Promise<string> {
    const dateStr = format(importDate, 'yyyyMMdd');
    const prefix = `BATCH-${dateStr}-`;

    const count = await this.batchRepository.count({
      where: { batchCode: Like(`${prefix}%`) },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `${prefix}${sequence}`;
  }

  async create(dto: CreateBatchDto, baseQuantity: number) {
    const importDate = new Date(dto.importDate);
    const expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null;

    if (expiryDate && expiryDate <= importDate) {
      throw new BadRequestException('Expiry date must be after import date');
    }

    if (dto.unitCost <= 0) {
      throw new BadRequestException('Unit cost must be positive');
    }

    const batchCode = await this.generateBatchCode(importDate);

    const batch = this.batchRepository.create({
      batchCode,
      productId: dto.productId,
      supplierId: dto.supplierId,
      quantity: baseQuantity,
      importDate,
      expiryDate,
      unitCost: dto.unitCost,
      isDepleted: false,
    });

    return this.batchRepository.save(batch);
  }

  async findAll(dto: FindBatchesDto) {
    const { page = 1, limit = 20, productId, supplierId, expiryFrom, expiryTo, importFrom, importTo } = dto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) where.productId = productId;
    if (supplierId) where.supplierId = supplierId;
    if (expiryFrom && expiryTo) where.expiryDate = Between(new Date(expiryFrom), new Date(expiryTo));
    if (importFrom && importTo) where.importDate = Between(new Date(importFrom), new Date(importTo));

    const [data, total] = await this.batchRepository.findAndCount({
      where,
      relations: ['product', 'supplier'],
      skip,
      take: limit,
      order: { importDate: 'DESC' },
    });

    return createPaginatedResult(data, total, page, limit);
  }

  async findOne(id: number) {
    const batch = await this.batchRepository.findOne({
      where: { id },
      relations: ['product', 'supplier'],
    });
    if (!batch) {
      throw new NotFoundException('Batch not found');
    }
    return batch;
  }

  async update(id: number, dto: UpdateBatchDto) {
    const batch = await this.findOne(id);

    if (dto.quantity !== undefined) {
      if (dto.quantity < 0) {
        throw new BadRequestException('Quantity cannot be negative');
      }
      batch.quantity = dto.quantity;
      batch.isDepleted = dto.quantity === 0;
    }

    if (dto.expiryDate) {
      batch.expiryDate = new Date(dto.expiryDate);
    }

    if (dto.unitCost) {
      batch.unitCost = dto.unitCost;
    }

    if (dto.isDepleted !== undefined) {
      batch.isDepleted = dto.isDepleted;
    }

    return this.batchRepository.save(batch);
  }

  async findNonDepletedByProduct(productId: number) {
    return this.batchRepository.find({
      where: { productId, isDepleted: false },
      order: { importDate: 'ASC' },
    });
  }

  async getTotalAvailableQuantity(productId: number): Promise<number> {
    const result = await this.batchRepository
      .createQueryBuilder('batch')
      .select('COALESCE(SUM(batch.quantity), 0)', 'total')
      .where('batch.product_id = :productId', { productId })
      .andWhere('batch.is_depleted = false')
      .getRawOne();

    return parseFloat(result.total) || 0;
  }
}
