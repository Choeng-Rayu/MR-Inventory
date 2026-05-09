import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Batch } from '../../common/entities/batch.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { TelegramBotService } from '../telegram/telegram.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class ExpiryMonitorService {
  private readonly logger = new Logger(ExpiryMonitorService.name);

  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    private notificationsService: NotificationsService,
    private telegramBotService: TelegramBotService,
    private settingsService: SettingsService,
  ) {}

  @Cron('0 0 * * *')
  async detectExpiry() {
    try {
      this.logger.log('Starting expiry detection...');

      const threshold = parseInt(await this.settingsService.getValue('near_expiry_threshold') || '30');
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() + threshold);

      // Find near-expiry batches
      const nearExpiryBatches = await this.batchRepository.find({
        where: {
          expiryDate: Between(new Date(), thresholdDate),
          isDepleted: false,
        },
        relations: ['product'],
      });

      for (const batch of nearExpiryBatches) {
        const notification = await this.notificationsService.create({
          userId: 1, // Default admin user
          type: 'near_expiry',
          title: `Product Near Expiry: ${batch.product?.name || 'Unknown'}`,
          message: `Batch ${batch.batchCode} expires on ${batch.expiryDate?.toISOString().split('T')[0]}`,
          relatedProductId: batch.productId,
          relatedBatchId: batch.id,
        });
        await this.telegramBotService.sendNotification(notification);
      }

      // Find expired batches
      const expiredBatches = await this.batchRepository.find({
        where: {
          expiryDate: LessThan(new Date()),
          isDepleted: false,
        },
        relations: ['product'],
      });

      for (const batch of expiredBatches) {
        const notification = await this.notificationsService.create({
          userId: 1, // Default admin user
          type: 'expired',
          title: `Product Expired: ${batch.product?.name || 'Unknown'}`,
          message: `Batch ${batch.batchCode} expired on ${batch.expiryDate?.toISOString().split('T')[0]}`,
          relatedProductId: batch.productId,
          relatedBatchId: batch.id,
        });
        await this.telegramBotService.sendNotification(notification);
      }

      this.logger.log(`Expiry detection completed: ${nearExpiryBatches.length} near expiry, ${expiredBatches.length} expired`);
    } catch (error) {
      this.logger.error('Expiry detection failed', error);
    }
  }
}
