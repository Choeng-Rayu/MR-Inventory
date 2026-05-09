import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from '../../common/entities/product.entity';
import { Category } from '../../common/entities/category.entity';
import { Batch } from '../../common/entities/batch.entity';
import { ImageStorageModule } from '../image-storage/image-storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Batch]), ImageStorageModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
