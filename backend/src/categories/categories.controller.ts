import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.categoriesService.findAll(req.user.userId);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.categoriesService.remove(req.user.userId, id);
  }
}
