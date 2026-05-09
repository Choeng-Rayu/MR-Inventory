import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Product } from './product.entity';
import { Batch } from './batch.entity';
import { Unit } from './unit.entity';
import { User } from './user.entity';

export type TransactionType = 'check_in' | 'check_out' | 'adjustment' | 'damage' | 'return';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ['check_in', 'check_out', 'adjustment', 'damage', 'return'] })
  type: TransactionType;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @Column({ name: 'batch_id', type: 'int' })
  batchId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: 'Quantity in base unit' })
  quantity: number;

  @Column({ name: 'unit_id', type: 'int', comment: 'Unit used for this transaction' })
  unitId: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => Product, product => product.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Batch, batch => batch.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batch_id' })
  batch: Batch;

  @ManyToOne(() => Unit, unit => unit.transactions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @ManyToOne(() => User, user => user.transactions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
