import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Supplier } from '../../common/entities/supplier.entity';
import { Batch } from '../../common/entities/batch.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { createPaginatedResult } from '../../common/utils/pagination.util';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
  ) {}

  async create(dto: CreateSupplierDto) {
    const supplier = this.supplierRepository.create({
      name: dto.name,
      contactPerson: dto.contactPerson,
      phone: dto.phone,
      email: dto.email,
      address: dto.address,
    });
    return this.supplierRepository.save(supplier);
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.supplierRepository.findAndCount({
      order: { name: 'ASC' },
      skip,
      take: limit,
    });
    return createPaginatedResult(data, total, page, limit);
  }

  async findOne(id: number) {
    const supplier = await this.supplierRepository.findOne({ where: { id } });
    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }
    return supplier;
  }

  async update(id: number, dto: UpdateSupplierDto) {
    const supplier = await this.findOne(id);
    Object.assign(supplier, dto);
    return this.supplierRepository.save(supplier);
  }

  async remove(id: number) {
    const supplier = await this.findOne(id);
    const batchesCount = await this.batchRepository.count({ where: { supplierId: id } });
    if (batchesCount > 0) {
      throw new BadRequestException('Cannot delete supplier with associated batches');
    }
    await this.supplierRepository.remove(supplier);
    return { message: 'Supplier deleted' };
  }

  async getInventoryHistory(id: number, startDate?: Date, endDate?: Date, productId?: number) {
    const supplier = await this.findOne(id);

    const where: any = { supplierId: id };
    if (startDate && endDate) {
      where.importDate = Between(startDate, endDate);
    }
    if (productId) {
      where.productId = productId;
    }

    const batches = await this.batchRepository.find({
      where,
      relations: ['product', 'supplier'],
      order: { importDate: 'DESC' },
    });

    const totalValue = batches.reduce((sum, batch) => sum + (batch.quantity * batch.unitCost), 0);

    return { supplier, batches, totalValue };
  }
}
