import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { ShopAccessGuard } from './guards/shop-access.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ShopsController],
  providers: [ShopsService, ShopAccessGuard],
  exports: [ShopsService, ShopAccessGuard],
})
export class ShopsModule {}
