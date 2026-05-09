import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, OneToMany, Index,
} from 'typeorm';
import { Category } from './category.entity';
import { Unit } from './unit.entity';
import { Batch } from './batch.entity';
import { Transaction } from './transaction.entity';
import { Notification } from './notification.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string | null;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  barcode: string | null;

  @Column({ name: 'category_id', type: 'int', nullable: true })
  @Index()
  categoryId: number | null;

  @Column({ name: 'base_unit', type: 'varchar', length: 50 })
  baseUnit: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'low_stock_threshold', type: 'decimal', precision: 10, scale: 2, default: 0 })
  lowStockThreshold: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Category, category => category.products, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Unit, unit => unit.product)
  units: Unit[];

  @OneToMany(() => Batch, batch => batch.product)
  batches: Batch[];

  @OneToMany(() => Transaction, transaction => transaction.product)
  transactions: Transaction[];

  @OneToMany(() => Notification, notification => notification.relatedProduct)
  notifications: Notification[];
}
