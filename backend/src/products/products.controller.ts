import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopAccessGuard } from '../shops/guards/shop-access.guard';
import { CurrentShop } from '../shops/decorators/current-shop.decorator';

@UseGuards(JwtAuthGuard, ShopAccessGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@CurrentShop() shopId: string, @Body() dto: CreateProductDto) {
    return this.productsService.create(shopId, dto);
  }

  @Get()
  findAll(@CurrentShop() shopId: string, @Query('search') search?: string) {
    return this.productsService.findAll(shopId, search);
  }

  @Get(':id')
  findOne(@CurrentShop() shopId: string, @Param('id') id: string) {
    return this.productsService.findOne(shopId, id);
  }

  @Patch(':id')
  update(
    @CurrentShop() shopId: string,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(shopId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentShop() shopId: string, @Param('id') id: string) {
    return this.productsService.remove(shopId, id);
  }
}
