import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductSchema } from './schemas/product.schema';
import { AuthModule } from '../auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }])],
  controllers: [ProductController],
  providers: [ProductService , {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },],
})
export class ProductModule {}
