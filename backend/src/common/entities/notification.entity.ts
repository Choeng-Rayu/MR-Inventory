import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';
import { Product } from './product.entity';
import { Batch } from './batch.entity';

export type NotificationType = 'near_expiry' | 'expired' | 'low_stock' | 'check_in' | 'check_out';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ type: 'enum', enum: ['near_expiry', 'expired', 'low_stock', 'check_in', 'check_out'] })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'related_product_id', type: 'int', nullable: true })
  relatedProductId: number | null;

  @Column({ name: 'related_batch_id', type: 'int', nullable: true })
  relatedBatchId: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, user => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, product => product.notifications, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'related_product_id' })
  relatedProduct: Product;

  @ManyToOne(() => Batch, batch => batch.notifications, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'related_batch_id' })
  relatedBatch: Batch;
}
