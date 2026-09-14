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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopAccessGuard } from '../shops/guards/shop-access.guard';
import { CurrentShop } from '../shops/decorators/current-shop.decorator';

@UseGuards(JwtAuthGuard, ShopAccessGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  create(@CurrentShop() shopId: string, @Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(shopId, dto);
  }

  @Get()
  findAll(@CurrentShop() shopId: string, @Query('search') search?: string) {
    return this.suppliersService.findAll(shopId, search);
  }

  @Get(':id')
  findOne(@CurrentShop() shopId: string, @Param('id') id: string) {
    return this.suppliersService.findOne(shopId, id);
  }

  @Patch(':id')
  update(
    @CurrentShop() shopId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(shopId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentShop() shopId: string, @Param('id') id: string) {
    return this.suppliersService.remove(shopId, id);
  }
}
