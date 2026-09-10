import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private async getShopId(userId: string) {
    const shop = await this.prisma.shop.findFirst({ where: { ownerId: userId } });
    if (!shop) throw new NotFoundException('Boutique introuvable');
    return shop.id;
  }

  async create(userId: string, dto: CreateCategoryDto) {
    const shopId = await this.getShopId(userId);
    return this.prisma.category.create({
      data: { name: dto.name, color: dto.color ?? null, shopId },
    });
  }

  async findAll(userId: string) {
    const shopId = await this.getShopId(userId);
    return this.prisma.category.findMany({
      where: { shopId },
      orderBy: { name: 'asc' },
    });
  }

  async remove(userId: string, id: string) {
    const shopId = await this.getShopId(userId);
    const cat = await this.prisma.category.findFirst({ where: { id, shopId } });
    if (!cat) throw new NotFoundException('Categorie introuvable');
    return this.prisma.category.delete({ where: { id } });
  }
}
