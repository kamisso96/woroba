import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private notifications: NotificationsService,
    private prisma: PrismaService,
  ) {}

  /**
   * Test manuel : verifie TOUTES les boutiques de l'utilisateur
   * et envoie les alertes pour celles qui ont des produits critiques.
   */
  @Post('test-stock-alert')
  async testStockAlert(@Req() req: any) {
    const shops = await this.prisma.shop.findMany({
      where: { ownerId: req.user.userId },
      include: { owner: true },
    });

    if (shops.length === 0) {
      return { sent: 0, checked: 0, shops: 0, message: 'Aucune boutique' };
    }

    const details: Array<{
      shop: string;
      sent: number;
      checked: number;
    }> = [];

    let totalSent = 0;
    let totalChecked = 0;

    for (const shop of shops) {
      const result = await this.notifications.checkShop(
        shop.id,
        shop.owner.email,
        shop.name,
      );
      totalSent += result.sent;
      totalChecked += result.checked;
      details.push({
        shop: shop.name,
        sent: result.sent,
        checked: result.checked,
      });
    }

    return {
      sent: totalSent,
      checked: totalChecked,
      shops: shops.length,
      details,
    };
  }
}