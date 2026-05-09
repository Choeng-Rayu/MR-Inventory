import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../common/entities/notification.entity';
import { FindNotificationsDto } from './dto/find-notifications.dto';
import { createPaginatedResult } from '../../common/utils/pagination.util';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async create(data: Partial<Notification>) {
    const notification = this.notificationRepository.create(data);
    return this.notificationRepository.save(notification);
  }

  async findAll(userId: number, dto: FindNotificationsDto) {
    const { page = 1, limit = 20, type, isRead } = dto;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead;

    const [data, total] = await this.notificationRepository.findAndCount({
      where,
      relations: ['relatedProduct', 'relatedBatch'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return createPaginatedResult(data, total, page, limit);
  }

  async getUnreadCount(userId: number) {
    const count = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(id: number, userId: number) {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: number) {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { updatedCount: result.affected || 0 };
  }
}
