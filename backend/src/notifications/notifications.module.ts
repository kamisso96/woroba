import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsCron } from './notifications.cron';
import { EmailService } from './email.service';
import { AuthModule } from '../auth/auth.module';
import { ShopsModule } from '../shops/shops.module';

@Module({
  imports: [AuthModule, ShopsModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, EmailService, NotificationsCron],
  exports: [NotificationsService],
})
export class NotificationsModule {}