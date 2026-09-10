import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly service: SalesService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateSaleDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.userId, id);
  }
}
