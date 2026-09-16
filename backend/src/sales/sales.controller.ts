import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
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

  @Get(':id/receipt')
  async receipt(
    @CurrentShop() shopId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.service.generateReceipt(shopId, id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }
}
