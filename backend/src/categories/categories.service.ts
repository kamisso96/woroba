import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

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
      orderBy: { name: 'asc' },
    });
  }

  async remove(shopId: string, id: string) {
    const cat = await this.prisma.category.findFirst({ where: { id, shopId } });
    if (!cat) throw new NotFoundException('Categorie introuvable');
    return this.prisma.category.delete({ where: { id } });
  }
}
