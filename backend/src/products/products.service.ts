import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private async getShopId(userId: string) {
    const shop = await this.prisma.shop.findFirst({ where: { ownerId: userId } });
    if (!shop) throw new NotFoundException('Boutique introuvable');
    return shop.id;
  }

  private cleanStrings(dto: any) {
    // Transforme les chaines vides en null pour eviter les conflits d'unicite sur sku
    const cleaned: any = { ...dto };
    for (const key of ['sku', 'barcode', 'description', 'imageUrl', 'categoryId']) {
      if (cleaned[key] === '') cleaned[key] = null;
    }
    return cleaned;
  }

  async create(userId: string, dto: CreateProductDto) {
    const shopId = await this.getShopId(userId);
    return this.prisma.product.create({
      data: { ...this.cleanStrings(dto), shopId },
    });
  }

  async findAll(userId: string, search?: string) {
    const shopId = await this.getShopId(userId);
    return this.prisma.product.findMany({
      where: {
        shopId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const shopId = await this.getShopId(userId);
    const product = await this.prisma.product.findFirst({
      where: { id, shopId },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  async update(userId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(userId, id);
    return this.prisma.product.update({
      where: { id },
      data: this.cleanStrings(dto),
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.product.delete({ where: { id } });
  }
}
