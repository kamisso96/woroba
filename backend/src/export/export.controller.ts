import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopAccessGuard } from '../shops/guards/shop-access.guard';
import { CurrentShop } from '../shops/decorators/current-shop.decorator';
import {
  ExportFormat,
  ExportService,
  ExportType,
} from './export.service';

const FORMATS: ExportFormat[] = ['csv', 'xlsx', 'pdf'];
const TYPES: ExportType[] = ['products', 'sales', 'movements'];

@UseGuards(JwtAuthGuard, ShopAccessGuard)
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('products')
  async products(
    @CurrentShop() shopId: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    return this.handle('products', format, shopId, res);
  }

  @Get('sales')
  async sales(
    @CurrentShop() shopId: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    return this.handle('sales', format, shopId, res);
  }

  @Get('movements')
  async movements(
    @CurrentShop() shopId: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    return this.handle('movements', format, shopId, res);
  }

  private async handle(
    type: ExportType,
    format: string,
    shopId: string,
    res: Response,
  ) {
    if (!TYPES.includes(type)) {
      throw new BadRequestException('Type d\'export invalide');
    }
    const fmt = (format || 'csv').toLowerCase() as ExportFormat;
    if (!FORMATS.includes(fmt)) {
      throw new BadRequestException(
        'Format invalide. Utilisez csv, xlsx ou pdf.',
      );
    }

    const { buffer, filename, mimetype } = await this.exportService.generate(
      '',
      shopId,
      type,
      fmt,
    );

    res.setHeader('Content-Type', mimetype);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }
}
