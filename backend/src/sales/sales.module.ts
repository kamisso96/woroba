import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { AuthModule } from '../auth/auth.module';
import { ShopsModule } from '../shops/shops.module';

@Module({
  imports: [AuthModule, ShopsModule],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
