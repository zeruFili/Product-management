import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: mongoose.Model<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    const products = await this.productModel.find();
    return products;
  }

  async create(product: CreateProductDto): Promise<Product> {
    const res = await this.productModel.create(product);
    return res;
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException('Product not found.');
    }

    return product;
  }

  async updateById(id: string, product): Promise<Product> {
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id, 
      product, 
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      throw new NotFoundException('Product not found.');
    }

    return updatedProduct;
  }

  async deleteById(id: string): Promise<Product> {
    const deletedProduct = await this.productModel.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      throw new NotFoundException('Product not found.');
    }

    return deletedProduct;
  }
}