import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './schemas/product.schema';

@Controller('products')
export class BookController {
  constructor(private productService: ProductService) {} 

  @Get()
  async getAllBooks(): Promise<Product[]> {
    return this.productService.findAll();
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
