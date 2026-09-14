import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopAccessGuard } from '../shops/guards/shop-access.guard';
import { CurrentShop } from '../shops/decorators/current-shop.decorator';
import { MovementType } from '@prisma/client';

@UseGuards(JwtAuthGuard, ShopAccessGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly service: StockMovementsService) {}

  @Post()
  create(
    @Req() req: any,
    @CurrentShop() shopId: string,
    @Body() dto: CreateMovementDto,
  ) {
    return this.service.create(req.user.userId, shopId, dto);
  }

  @Get()
  findAll(
    @CurrentShop() shopId: string,
    @Query('productId') productId?: string,
    @Query('type') type?: MovementType,
  ) {
    return this.service.findAll(shopId, productId, type);
  }
}
