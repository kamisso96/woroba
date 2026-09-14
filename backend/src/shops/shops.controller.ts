import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.shopsService.findAll(req.user.userId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateShopDto) {
    return this.shopsService.create(req.user.userId, dto);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.shopsService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateShopDto,
  ) {
    return this.shopsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.shopsService.remove(req.user.userId, id);
  }
}