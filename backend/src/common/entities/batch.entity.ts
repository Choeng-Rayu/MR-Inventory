import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, OneToMany, Index,
} from 'typeorm';
import { Product } from './product.entity';
import { Supplier } from './supplier.entity';
import { Transaction } from './transaction.entity';
import { Notification } from './notification.entity';

@Entity('batches')
export class Batch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'batch_code', type: 'varchar', length: 50, unique: true })
  batchCode: string;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @Column({ name: 'supplier_id', type: 'int' })
  supplierId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: 'Quantity in base unit' })
  quantity: number;

  @Column({ name: 'import_date', type: 'date' })
  importDate: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date | null;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 10, scale: 2 })
  unitCost: number;

  @Column({ name: 'is_depleted', type: 'boolean', default: false })
  isDepleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Product, product => product.batches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Supplier, supplier => supplier.batches, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @OneToMany(() => Transaction, transaction => transaction.batch)
  transactions: Transaction[];

  @OneToMany(() => Notification, notification => notification.relatedBatch)
  notifications: Notification[];
}
