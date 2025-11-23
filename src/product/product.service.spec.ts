import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import mongoose, { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProductService', () => {
  let productService: ProductService;
  let model: Model<Product>;

  const mockProduct = {
    _id: '61c0ccf11d7bf83d153d7c06',
    name: 'Test Product',
    description: 'Product Description',
    price: 99.99,
    category: 'electronics',
    stock: 50,
  };

  const mockProductService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductService,
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    model = module.get<Model<Product>>(getModelToken(Product.name));
  });

  describe('findById', () => {
    it('should find and return a product by ID', async () => {
      // Arrange
      jest.spyOn(model, 'findById').mockResolvedValue(mockProduct);

      // Act
      const result = await productService.findById(mockProduct._id);

      // Assert
      expect(model.findById).toHaveBeenCalledWith(mockProduct._id);
      expect(result).toEqual(mockProduct);
    });

    it('should throw BadRequestException if invalid ID is provided', async () => {
      // Arrange
      const id = 'invalid-id';
      const isValidObjectIDMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      // Act & Assert
      await expect(productService.findById(id)).rejects.toThrow(
        BadRequestException,
      );

      expect(isValidObjectIDMock).toHaveBeenCalledWith(id);
      isValidObjectIDMock.mockRestore();
    });

    it('should throw NotFoundException if product is not found', async () => {
      // Arrange
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      // Act & Assert
      await expect(productService.findById(mockProduct._id)).rejects.toThrow(
        NotFoundException,
      );

      expect(model.findById).toHaveBeenCalledWith(mockProduct._id);
    });
  });
});