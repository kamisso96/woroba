import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsCron {
  private readonly logger = new Logger(NotificationsCron.name);

  constructor(private notifications: NotificationsService) {}

  @Cron('0 8 * * *', {
    name: 'daily-stock-check',
    timeZone: 'Africa/Abidjan',
  })
  async handleDailyCheck() {
    this.logger.log('Verification quotidienne des stocks...');
    try {
      const result = await this.notifications.checkAllShopsAndNotify();
      this.logger.log(
        `Verification terminee : ${result.sent} alerte(s) sur ${result.shops} boutique(s)`,
      );
    } catch (err) {
      this.logger.error('Erreur lors de la verification:', err);
    }
  }
}