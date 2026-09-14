import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Injectable()
export class ShopsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.shop.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const shop = await this.prisma.shop.findFirst({
      where: { id, ownerId: userId },
    });
    if (!shop) throw new NotFoundException('Boutique introuvable');
    return shop;
  }

  async create(userId: string, dto: CreateShopDto) {
    return this.prisma.shop.create({
      data: {
        ownerId: userId,
        name: dto.name,
        currency: dto.currency ?? 'XOF',
        address: dto.address ?? null,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateShopDto) {
    await this.findOne(userId, id);
    return this.prisma.shop.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.currency !== undefined ? { currency: dto.currency } : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl } : {}),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    // Protection : ne pas supprimer la derniere boutique
    const count = await this.prisma.shop.count({ where: { ownerId: userId } });
    if (count <= 1) {
      throw new BadRequestException(
        'Vous ne pouvez pas supprimer votre seule boutique',
      );
    }

    // Cascade automatique sur categories, products, movements, sales...
    await this.prisma.shop.delete({ where: { id } });
    return { success: true };
  }
}
