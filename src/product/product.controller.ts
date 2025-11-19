import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
   Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';
import type { Query as ExpressQuery } from 'express-serve-static-core';

@Controller('products')
export class BookController {
  constructor(private productService: ProductService) {} 

  @Get()
  async getAllBooks(@Query() query: ExpressQuery): Promise<Product[]> {
    return this.productService.findAll(query);
  }

  @Post()
  async createBook(
    @Body()
    Product: CreateProductDto,
  ): Promise<Product> {
    return this.productService.create(Product);
  }

  @Get(':id')
  async getBook(
    @Param('id')
    id: string,
  ): Promise<Product> {
    return this.productService.findById(id);
  }

  @Put(':id')
  async updateBook(
    @Param('id')
    id: string,
    @Body()
    Product: UpdateProductDto,
  ): Promise<Product> {
    return this.productService.updateById(id, Product);
  }

  @Delete(':id')
  async deleteBook(
    @Param('id')
    id: string,
  ): Promise<Product> {
    return this.productService.deleteById(id);
  }
}
