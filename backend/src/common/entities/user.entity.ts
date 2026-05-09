import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Notification } from './notification.entity';
import { Transaction } from './transaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  @Exclude()
  passwordHash: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'oauth_provider', type: 'enum', enum: ['google', 'telegram'], nullable: true })
  oauthProvider: string | null;

  @Column({ name: 'oauth_id', type: 'varchar', length: 255, nullable: true })
  @Exclude()
  oauthId: string | null;

  @Column({ name: 'profile_picture', type: 'varchar', length: 500, nullable: true })
  profilePicture: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions: Transaction[];
}
