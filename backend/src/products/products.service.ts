import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  private cleanStrings(dto: any) {
    const cleaned: any = { ...dto };
    for (const key of ['sku', 'barcode', 'description', 'imageUrl', 'categoryId']) {
      if (cleaned[key] === '') cleaned[key] = null;
    }
    return cleaned;
  }

  async create(shopId: string, dto: CreateProductDto) {
    return this.prisma.product.create({
      data: { ...this.cleanStrings(dto), shopId },
    });
  }

  async findAll(shopId: string, search?: string) {
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

  async findOne(shopId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, shopId },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Produit introuvable');
    return product;
  }

  async update(shopId: string, id: string, dto: UpdateProductDto) {
    await this.findOne(shopId, id);
    return this.prisma.product.update({
      where: { id },
      data: this.cleanStrings(dto),
    });
  }

  async remove(shopId: string, id: string) {
    await this.findOne(shopId, id);
    return this.prisma.product.delete({ where: { id } });
  }
}
