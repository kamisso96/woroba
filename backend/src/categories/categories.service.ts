import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(shopId: string, dto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: { name: dto.name, color: dto.color ?? null, shopId },
    });
  }

  async findAll(shopId: string) {
    return this.prisma.category.findMany({
      where: { shopId },
      include: {
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(shopId: string, id: string, dto: UpdateCategoryDto) {
    const cat = await this.prisma.category.findFirst({
      where: { id, shopId },
    });
    if (!cat) throw new NotFoundException('Categorie introuvable');

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
      },
    });
  }

  async remove(shopId: string, id: string) {
    const cat = await this.prisma.category.findFirst({
      where: { id, shopId },
    });
    if (!cat) throw new NotFoundException('Categorie introuvable');
    return this.prisma.category.delete({ where: { id } });
  }
}
