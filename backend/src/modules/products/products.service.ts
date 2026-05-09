import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Brackets } from 'typeorm';
import { Product } from '../../common/entities/product.entity';
import { Category } from '../../common/entities/category.entity';
import { Batch } from '../../common/entities/batch.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { createPaginatedResult } from '../../common/utils/pagination.util';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
  ) {}

  async create(dto: CreateProductDto) {
    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    const product = this.productRepository.create({
      name: dto.name,
      sku: dto.sku,
      barcode: dto.barcode,
      categoryId: dto.categoryId,
      baseUnit: dto.baseUnit,
      description: dto.description,
      lowStockThreshold: dto.lowStockThreshold ?? 0,
    });

    return this.productRepository.save(product);
  }

  async findAll(dto: FindProductsDto) {
    const { page = 1, limit = 20, search, categoryId, stockStatus } = dto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.batches', 'batch', 'batch.is_depleted = false')
      .select(['product', 'category'])
      .addSelect('COALESCE(SUM(batch.quantity), 0)', 'total_quantity')
      .groupBy('product.id')
      .addGroupBy('category.id');

    if (search) {
      queryBuilder.andWhere(
        new Brackets(qb => {
          qb.where('product.name LIKE :search', { search: `%${search}%` })
            .orWhere('product.sku LIKE :search', { search: `%${search}%` })
            .orWhere('product.barcode LIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    const [products, total] = await Promise.all([
      queryBuilder.skip(skip).take(limit).orderBy('product.name', 'ASC').getRawAndEntities(),
      queryBuilder.getCount(),
    ]);

    // Map raw quantities to entities
    const data = products.entities.map((product, index) => {
      const raw = products.raw[index];
      return {
        ...product,
        totalQuantity: parseFloat(raw.total_quantity) || 0,
      };
    });

    if (stockStatus) {
      const filtered = data.filter(p => {
        if (stockStatus === 'out_of_stock') return p.totalQuantity === 0;
        if (stockStatus === 'low_stock') return p.totalQuantity > 0 && p.totalQuantity < p.lowStockThreshold;
        if (stockStatus === 'in_stock') return p.totalQuantity >= p.lowStockThreshold;
        return true;
      });
      return createPaginatedResult(filtered, filtered.length, page, limit);
    }

    return createPaginatedResult(data, total, page, limit);
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'units'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findByBarcode(barcode: string) {
    const product = await this.productRepository.findOne({
      where: { barcode },
      relations: ['category', 'units'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: dto.categoryId } });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    Object.assign(product, {
      name: dto.name ?? product.name,
      sku: dto.sku !== undefined ? dto.sku : product.sku,
      barcode: dto.barcode !== undefined ? dto.barcode : product.barcode,
      categoryId: dto.categoryId !== undefined ? dto.categoryId : product.categoryId,
      baseUnit: dto.baseUnit ?? product.baseUnit,
      description: dto.description !== undefined ? dto.description : product.description,
      lowStockThreshold: dto.lowStockThreshold ?? product.lowStockThreshold,
    });

    return this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return { message: 'Product deleted' };
  }

  async updateImageUrl(id: number, imageUrl: string) {
    const product = await this.findOne(id);
    product.imageUrl = imageUrl;
    return this.productRepository.save(product);
  }
}
