import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Setting } from '../../common/entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingRepository: Repository<Setting>,
    private configService: ConfigService,
  ) {}

  async getValue(key: string): Promise<string | null> {
    const setting = await this.settingRepository.findOne({ where: { keyName: key } });
    if (!setting) return null;
    if (setting.isEncrypted) {
      return this.decryptValue(setting.value);
    }
    return setting.value;
  }

  async getSettings() {
    const settings = await this.settingRepository.find();
    const result: Record<string, any> = {};

    for (const setting of settings) {
      let value = setting.value;
      if (setting.isEncrypted) {
        value = '***encrypted***';
      }
      result[setting.keyName] = value;
    }

    // Defaults
    if (!result.near_expiry_threshold) result.near_expiry_threshold = '30';
    if (!result.low_stock_threshold) result.low_stock_threshold = '10';
    if (!result.telegram_enabled) result.telegram_enabled = 'false';

    return result;
  }

  async updateSettings(data: Record<string, any>) {
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;

      let strValue = String(value);
      let isEncrypted = false;

      if (key === 'telegram_bot_token' && strValue) {
        isEncrypted = true;
        strValue = this.encryptValue(strValue);
      }

      const existing = await this.settingRepository.findOne({ where: { keyName: key } });
      if (existing) {
        existing.value = strValue;
        existing.isEncrypted = isEncrypted;
        await this.settingRepository.save(existing);
      } else {
        const setting = this.settingRepository.create({
          keyName: key,
          value: strValue,
          isEncrypted,
        });
        await this.settingRepository.save(setting);
      }
    }

    return this.getSettings();
  }

  private encryptValue(value: string): string {
    const key = this.configService.get<string>('app.encryptionKey') || 'default_key_32_chars_long__';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.padEnd(32).slice(0, 32)), iv);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decryptValue(encrypted: string): string {
    const key = this.configService.get<string>('app.encryptionKey') || 'default_key_32_chars_long__';
    const [ivHex, encryptedHex] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.padEnd(32).slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
