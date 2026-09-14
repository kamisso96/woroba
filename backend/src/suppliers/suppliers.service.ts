import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  private cleanStrings(dto: any) {
    const cleaned: any = { ...dto };
    for (const key of ['contactName', 'email', 'phone', 'address']) {
      if (cleaned[key] === '') cleaned[key] = null;
    }
    return cleaned;
  }

  async create(shopId: string, dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: { ...this.cleanStrings(dto), shopId },
    });
  }

  async findAll(shopId: string, search?: string) {
    return this.prisma.supplier.findMany({
      where: {
        shopId,
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { contactName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(shopId: string, id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, shopId },
    });
    if (!supplier) throw new NotFoundException('Fournisseur introuvable');
    return supplier;
  }

  async update(shopId: string, id: string, dto: UpdateSupplierDto) {
    await this.findOne(shopId, id);
    return this.prisma.supplier.update({
      where: { id },
      data: this.cleanStrings(dto),
    });
  }

  async remove(shopId: string, id: string) {
    await this.findOne(shopId, id);
    return this.prisma.supplier.delete({ where: { id } });
  }
}
