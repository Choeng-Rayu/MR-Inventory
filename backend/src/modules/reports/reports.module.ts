import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Product } from '../../common/entities/product.entity';
import { Batch } from '../../common/entities/batch.entity';
import { Supplier } from '../../common/entities/supplier.entity';
import { Transaction } from '../../common/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Batch, Supplier, Transaction])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
