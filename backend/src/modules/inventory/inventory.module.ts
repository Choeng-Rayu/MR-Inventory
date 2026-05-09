import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckInService, CheckOutService, AdjustmentService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Batch } from '../../common/entities/batch.entity';
import { Transaction } from '../../common/entities/transaction.entity';
import { BatchesModule } from '../batches/batches.module';
import { UnitsModule } from '../units/units.module';

@Module({
  imports: [TypeOrmModule.forFeature([Batch, Transaction]), BatchesModule, UnitsModule],
  controllers: [InventoryController],
  providers: [CheckInService, CheckOutService, AdjustmentService],
  exports: [CheckInService, CheckOutService, AdjustmentService],
})
export class InventoryModule {}
