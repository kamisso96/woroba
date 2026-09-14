import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopAccessGuard } from '../shops/guards/shop-access.guard';
import { CurrentShop } from '../shops/decorators/current-shop.decorator';

@UseGuards(JwtAuthGuard, ShopAccessGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly service: SalesService) {}

  @Post()
  create(
    @Req() req: any,
    @CurrentShop() shopId: string,
    @Body() dto: CreateSaleDto,
  ) {
    return this.service.create(req.user.userId, shopId, dto);
  }

  @Get()
  findAll(@CurrentShop() shopId: string) {
    return this.service.findAll(shopId);
  }

  @Get(':id')
  findOne(@CurrentShop() shopId: string, @Param('id') id: string) {
    return this.service.findOne(shopId, id);
  }
}
