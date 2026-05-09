import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitsService, UnitConverterService } from './units.service';
import { UnitsController } from './units.controller';
import { Unit } from '../../common/entities/unit.entity';
import { Batch } from '../../common/entities/batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unit, Batch])],
  controllers: [UnitsController],
  providers: [UnitsService, UnitConverterService],
  exports: [UnitsService, UnitConverterService],
})
export class UnitsModule {}
