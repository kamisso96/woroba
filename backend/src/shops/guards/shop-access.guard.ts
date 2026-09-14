import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ShopAccessGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<any>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifie');
    }

    // Priorite 1 : header X-Shop-Id
    const headerShopId = request.headers['x-shop-id'];

    if (headerShopId) {
      const shop = await this.prisma.shop.findFirst({
        where: { id: headerShopId, ownerId: user.userId },
      });

      if (!shop) {
        throw new ForbiddenException(
          'Vous n\'avez pas acces a cette boutique',
        );
      }

      request.shopId = shop.id;
      request.shop = shop;
      return true;
    }

    // Priorite 2 (fallback) : premiere boutique de l'utilisateur
    const shop = await this.prisma.shop.findFirst({
      where: { ownerId: user.userId },
      orderBy: { createdAt: 'asc' },
    });

    if (!shop) {
      throw new NotFoundException('Aucune boutique trouvee pour cet utilisateur');
    }

    request.shopId = shop.id;
    request.shop = shop;
    return true;
  }
}
