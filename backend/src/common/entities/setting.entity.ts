import {
  Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn,
} from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'key_name', type: 'varchar', length: 255, unique: true })
  keyName: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ name: 'is_encrypted', type: 'boolean', default: false })
  isEncrypted: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
