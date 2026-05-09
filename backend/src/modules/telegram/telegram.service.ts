import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Notification } from '../../common/entities/notification.entity';

@Injectable()
export class TelegramBotService {
  private readonly logger = new Logger(TelegramBotService.name);

  constructor(private configService: ConfigService) {}

  get botToken(): string | undefined {
    return this.configService.get<string>('telegram.botToken');
  }

  get chatId(): string | undefined {
    return this.configService.get<string>('telegram.chatId');
  }

  isEnabled(): boolean {
    return !!(this.botToken && this.chatId);
  }

  async sendNotification(notification: Notification): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const message = this.formatMessage(notification);

      await axios.post(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          chat_id: this.chatId,
          text: message,
          parse_mode: 'Markdown',
        },
      );

      this.logger.log(`Telegram notification sent: ${notification.type}`);
    } catch (error) {
      this.logger.error('Failed to send Telegram notification', error.message);
    }
  }

  private formatMessage(notification: Notification): string {
    const emoji = {
      near_expiry: '⚠️',
      expired: '❌',
      low_stock: '📉',
      check_in: '📥',
      check_out: '📤',
    };

    return `${emoji[notification.type] || '🔔'} *${notification.title}*\n\n${notification.message}`;
  }
}
