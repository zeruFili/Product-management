import {
   Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';
import type { Query as ExpressQuery } from 'express-serve-static-core';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {} 

    // @SkipThrottle()
  @Throttle({ default: { limit: 1, ttl: 2000 } })
   @Get()
  @Roles(Role.User, Role.Admin)
  @UseGuards(AuthGuard(), RolesGuard)
  async getAllProducts(@Query() query: ExpressQuery): Promise<Product[]> {
    return this.productService.findAll(query);
  }

  @Post()
  @UseGuards(AuthGuard())
  async createProduct(
    @Body()
    Product: CreateProductDto,
      @Req() req,
  ): Promise<Product> {
    return this.productService.create(  Product, req.user);
  }

  @Get(':id')
  async getProduct(
    @Param('id')
    id: string,
  ): Promise<Product> {
    return this.productService.findById(id);
  }

  @Put(':id')
  async updateProduct(
    @Param('id')
    id: string,
    @Body()
    Product: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.updateById(id, Product);
  }

  @Delete(':id')
  async deleteProduct(
    @Param('id')
    id: string,
  ): Promise<{deleted: boolean}> {
    return this.productService.deleteById(id);
  }
}
