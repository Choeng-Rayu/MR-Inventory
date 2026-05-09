import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpiryMonitorService } from './expiry-monitor.service';
import { Batch } from '../../common/entities/batch.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { TelegramModule } from '../telegram/telegram.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [TypeOrmModule.forFeature([Batch]), NotificationsModule, TelegramModule, SettingsModule],
  providers: [ExpiryMonitorService],
})
export class ExpiryMonitorModule {}
