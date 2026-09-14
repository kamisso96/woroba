import { Module } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { SuppliersController } from './suppliers.controller';
import { AuthModule } from '../auth/auth.module';
import { ShopsModule } from '../shops/shops.module';

@Module({
  imports: [AuthModule, ShopsModule],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
