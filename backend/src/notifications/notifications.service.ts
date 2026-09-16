import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  async checkAllShopsAndNotify(): Promise<{
    sent: number;
    checked: number;
    shops: number;
  }> {
    const shops = await this.prisma.shop.findMany({
      include: { owner: true },
    });

    let sent = 0;
    let checked = 0;

    for (const shop of shops) {
      try {
        const result = await this.checkShop(
          shop.id,
          shop.owner.email,
          shop.name,
        );
        sent += result.sent;
        checked += result.checked;
      } catch (err) {
        this.logger.error(`Erreur pour la boutique ${shop.name}:`, err);
      }
    }

    return { sent, checked, shops: shops.length };
  }

  async checkShop(
    shopId: string,
    ownerEmail: string,
    shopName: string,
  ): Promise<{ sent: number; checked: number }> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const products = await this.prisma.product.findMany({
      where: { shopId },
      include: { category: true },
    });

    const critical = products.filter((p) => p.quantity <= p.alertThreshold);

    if (critical.length === 0) {
      return { sent: 0, checked: products.length };
    }

    const recentAlerts = await this.prisma.alert.findMany({
      where: {
        shopId,
        createdAt: { gte: since },
        type: 'LOW_STOCK',
      },
      select: { productId: true },
    });

    const recentIds = new Set(recentAlerts.map((a) => a.productId));
    const toAlert = critical.filter((p) => !recentIds.has(p.id));

    if (toAlert.length === 0) {
      return { sent: 0, checked: products.length };
    }

    const html = this.buildAlertEmail(shopName, toAlert);
    const success = await this.email.send(
      ownerEmail,
      `[Woroba] ${toAlert.length} produit${toAlert.length > 1 ? 's' : ''} en alerte de stock`,
      html,
    );

    if (success) {
      await this.prisma.alert.createMany({
        data: toAlert.map((p) => ({
          shopId,
          productId: p.id,
          type: 'LOW_STOCK',
          isRead: false,
        })),
      });
      this.logger.log(
        `${toAlert.length} alerte(s) envoyee(s) a ${ownerEmail} (${shopName})`,
      );
      return { sent: toAlert.length, checked: products.length };
    }

    return { sent: 0, checked: products.length };
  }

  private buildAlertEmail(
    shopName: string,
    products: Array<{
      name: string;
      quantity: number;
      alertThreshold: number;
      unit: string;
    }>,
  ): string {
    const rows = products
      .map((p) => {
        const status =
          p.quantity <= 0
            ? '<span style="color:#dc2626;font-weight:600;">Rupture</span>'
            : '<span style="color:#d97706;font-weight:600;">Stock faible</span>';
        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${p.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${p.quantity} ${p.unit}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${p.alertThreshold} ${p.unit}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${status}</td>
          </tr>
        `;
      })
      .join('');

    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 640px; margin: 0 auto; padding: 32px 16px;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Woroba</h1>
      <p style="margin: 8px 0 0; color: #d1fae5; font-size: 14px;">Alerte de stock</p>
    </div>
    <div style="background: #ffffff; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
      <p style="margin: 0 0 8px; font-size: 16px; color: #0f172a;">Bonjour,</p>
      <p style="margin: 0 0 24px; font-size: 14px; color: #475569; line-height: 1.5;">
        Les produits suivants de <strong>${shopName}</strong> atteignent leur seuil critique. Pensez a les reapprovisionner.
      </p>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 12px; text-align: left; font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase;">Produit</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase;">Stock</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase;">Seuil</th>
            <th style="padding: 12px; text-align: right; font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase;">Statut</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="margin-top: 32px; text-align: center;">
        <a href="http://localhost:3001/products" style="display: inline-block; padding: 12px 24px; background: #10b981; color: #ffffff; text-decoration: none; border-radius: 9999px; font-weight: 600; font-size: 14px;">
          Voir mes produits
        </a>
      </div>

      <p style="margin: 32px 0 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
        Vous recevez cet email car les alertes de stock sont activees sur votre compte Woroba.
      </p>
    </div>
  </div>
</body>
</html>`;
  }
}