import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopAccessGuard } from '../shops/guards/shop-access.guard';
import { CurrentShop } from '../shops/decorators/current-shop.decorator';

@UseGuards(JwtAuthGuard, ShopAccessGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@CurrentShop() shopId: string, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(shopId, dto);
  }

  @Get()
  findAll(@CurrentShop() shopId: string) {
    return this.categoriesService.findAll(shopId);
  }

  @Patch(':id')
  update(
    @CurrentShop() shopId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(shopId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentShop() shopId: string, @Param('id') id: string) {
    return this.categoriesService.remove(shopId, id);
  }
}
