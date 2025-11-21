import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Product } from './schemas/product.schema';
import { Query } from 'express-serve-static-core';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: mongoose.Model<Product>,
  ) {}

  async findAll(query: Query): Promise<Product[]> {
    const resPerPage = 2;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    const keyword = query.keyword
      ? {
          name: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};

    const products = await this.productModel.find({ ...keyword })
      .limit(resPerPage)
      .skip(skip);;
    return products;
  }

  async create(product , user: User): Promise<Product> {
    const res = await this.productModel.create({ ...product ,   user : user._id } );
    return res;
  }

  async findById(id: string): Promise<Product> {

    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      throw new BadRequestException('Please enter correct id.');
    }
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