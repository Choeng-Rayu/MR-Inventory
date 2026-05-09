import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { Supplier } from '../../common/entities/supplier.entity';
import { Batch } from '../../common/entities/batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier, Batch])],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
