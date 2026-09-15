import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { SalesModule } from './sales/sales.module';
import { UsersModule } from './users/users.module';
import { ShopsModule } from './shops/shops.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    StockMovementsModule,
    SalesModule,
    UsersModule,
    ShopsModule,
    SuppliersModule,
    UploadsModule
  ],
})
export class AppModule {}
