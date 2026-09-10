import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  private async getShopId(userId: string) {
    const shop = await this.prisma.shop.findFirst({ where: { ownerId: userId } });
    if (!shop) throw new NotFoundException('Boutique introuvable');
    return shop.id;
  }

  async create(userId: string, dto: CreateSaleDto) {
    const shopId = await this.getShopId(userId);

    // Recuperer tous les produits concernes
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, shopId },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('Un ou plusieurs produits sont introuvables');
    }

    // Verifier le stock et calculer le total
    let total = 0;
    const saleItemsData: {
      productId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[] = [];

    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.quantity < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour "${product.name}". Disponible : ${product.quantity}`,
        );
      }
      const unitPrice = Number(product.sellingPrice);
      const totalPrice = unitPrice * item.quantity;
      total += totalPrice;

      saleItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    // Transaction : creer la vente + items + mouvements + maj du stock
    const sale = await this.prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          shopId,
          sellerId: userId,
          totalAmount: total,
          paymentMethod: dto.paymentMethod ?? PaymentMethod.CASH,
          saleItems: {
            create: saleItemsData,
          },
        },
        include: { saleItems: true },
      });

      // Mettre a jour le stock et creer les mouvements
      for (const item of saleItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            shopId,
            type: 'OUT',
            quantityChange: -item.quantity,
            reason: 'Vente',
            reference: created.id,
            createdById: userId,
          },
        });
      }

      return created;
    });

    return sale;
  }

  async findAll(userId: string) {
    const shopId = await this.getShopId(userId);
    return this.prisma.sale.findMany({
      where: { shopId },
      include: {
        saleItems: {
          include: {
            product: { select: { id: true, name: true, unit: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(userId: string, id: string) {
    const shopId = await this.getShopId(userId);
    const sale = await this.prisma.sale.findFirst({
      where: { id, shopId },
      include: {
        saleItems: {
          include: { product: { select: { id: true, name: true, unit: true } } },
        },
        seller: { select: { fullName: true } },
      },
    });
    if (!sale) throw new NotFoundException('Vente introuvable');
    return sale;
  }
}
