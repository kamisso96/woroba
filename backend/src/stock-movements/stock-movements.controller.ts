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
import { MovementType } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly service: StockMovementsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateMovementDto) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  findAll(
    @Req() req: any,
    @Query('productId') productId?: string,
    @Query('type') type?: MovementType,
  ) {
    return this.service.findAll(req.user.userId, productId, type);
  }
}
