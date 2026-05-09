import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../../common/entities/unit.entity';
import { Batch } from '../../common/entities/batch.entity';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
  ) {}

  async create(productId: number, dto: CreateUnitDto) {
    if (dto.isBaseUnit) {
      const existingBase = await this.unitRepository.findOne({
        where: { productId, isBaseUnit: true },
      });
      if (existingBase) {
        throw new BadRequestException('Product already has a base unit');
      }
      dto.conversionRate = 1.0;
    }

    const unit = this.unitRepository.create({
      productId,
      unitName: dto.unitName,
      conversionRate: dto.conversionRate,
      isBaseUnit: dto.isBaseUnit ?? false,
    });

    return this.unitRepository.save(unit);
  }

  async findByProduct(productId: number) {
    return this.unitRepository.find({ where: { productId } });
  }

  async findOne(id: number) {
    const unit = await this.unitRepository.findOne({ where: { id } });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }
    return unit;
  }

  async update(id: number, dto: UpdateUnitDto) {
    const unit = await this.findOne(id);

    if (dto.isBaseUnit) {
      const existingBase = await this.unitRepository.findOne({
        where: { productId: unit.productId, isBaseUnit: true },
      });
      if (existingBase && existingBase.id !== id) {
        throw new BadRequestException('Product already has a base unit');
      }
      dto.conversionRate = 1.0;
    }

    Object.assign(unit, dto);
    return this.unitRepository.save(unit);
  }

  async remove(id: number) {
    const unit = await this.findOne(id);
    const batchesCount = await this.batchRepository.count({ where: { productId: unit.productId } });
    if (batchesCount > 0) {
      throw new BadRequestException('Cannot delete unit with existing batches');
    }
    await this.unitRepository.remove(unit);
    return { message: 'Unit deleted' };
  }
}

@Injectable()
export class UnitConverterService {
  constructor(
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  toBaseUnit(quantity: number, conversionRate: number): number {
    return Math.round(quantity * conversionRate * 100) / 100;
  }

  fromBaseUnit(baseQuantity: number, conversionRate: number): number {
    return Math.round((baseQuantity / conversionRate) * 100) / 100;
  }

  async getConversionRate(unitId: number): Promise<number> {
    const unit = await this.unitRepository.findOne({ where: { id: unitId } });
    if (!unit) {
      throw new NotFoundException('Unit not found');
    }
    return unit.conversionRate;
  }

  async convertToBaseUnit(quantity: number, unitId: number): Promise<number> {
    const rate = await this.getConversionRate(unitId);
    return this.toBaseUnit(quantity, rate);
  }
}
