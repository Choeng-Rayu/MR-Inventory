import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, OneToMany, Unique,
} from 'typeorm';
import { Product } from './product.entity';
import { Transaction } from './transaction.entity';

@Entity('units')
@Unique(['productId', 'unitName'])
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @Column({ name: 'unit_name', type: 'varchar', length: 50 })
  unitName: string;

  @Column({ name: 'conversion_rate', type: 'decimal', precision: 10, scale: 4 })
  conversionRate: number;

  @Column({ name: 'is_base_unit', type: 'boolean', default: false })
  isBaseUnit: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Product, product => product.units, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(() => Transaction, transaction => transaction.unit)
  transactions: Transaction[];
}
