import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { MovementType } from '@prisma/client';

@Injectable()
export class StockMovementsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, shopId: string, dto: CreateMovementDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, shopId },
    });
    if (!product) throw new NotFoundException('Produit introuvable');

    let change: number;
    if (dto.type === 'IN') change = dto.quantity;
    else if (dto.type === 'OUT') change = -dto.quantity;
    else change = dto.quantity;

    const newQuantity = product.quantity + change;
    if (newQuantity < 0) {
      throw new BadRequestException(
        `Stock insuffisant. Disponible : ${product.quantity}`,
      );
    }

    const [movement] = await this.prisma.$transaction([
      this.prisma.stockMovement.create({
        data: {
          productId: product.id,
          shopId,
          type: dto.type,
          quantityChange: change,
          reason: dto.reason ?? null,
          reference: dto.reference ?? null,
          createdById: userId,
        },
      }),
      this.prisma.product.update({
        where: { id: product.id },
        data: { quantity: newQuantity },
      }),
    ]);

    return movement;
  }

  async findAll(shopId: string, productId?: string, type?: MovementType) {
    return this.prisma.stockMovement.findMany({
      where: {
        shopId,
        ...(productId ? { productId } : {}),
        ...(type ? { type } : {}),
      },
      include: {
        product: { select: { id: true, name: true, unit: true } },
        createdBy: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
