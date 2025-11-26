import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from './schemas/product.schema';
import mongoose, { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from '../auth/schemas/user.schema';

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
    user: '61c0ccf11d7bf83d153d7c06',
  };

  const mockUser = {
    _id: '61c0ccf11d7bf83d153d7c06',
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockProductService = {
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
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
      jest.spyOn(model, 'findById').mockResolvedValue(mockProduct);

      const result = await productService.findById(mockProduct._id);

      expect(model.findById).toHaveBeenCalledWith(mockProduct._id);
      expect(result).toEqual(mockProduct);
    });

    it('should throw BadRequestException if invalid ID is provided', async () => {
      const id = 'invalid-id';
      const isValidObjectIDMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(productService.findById(id)).rejects.toThrow(
        BadRequestException,
      );

      expect(isValidObjectIDMock).toHaveBeenCalledWith(id);
      isValidObjectIDMock.mockRestore();
    });

    it('should throw NotFoundException if product is not found', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      await expect(productService.findById(mockProduct._id)).rejects.toThrow(
        NotFoundException,
      );

      expect(model.findById).toHaveBeenCalledWith(mockProduct._id);
    });
  });

  describe('findAll', () => {
    it('should return an array of products with pagination', async () => {
      const mockProducts = [mockProduct, { ...mockProduct, _id: '2' }];
      const query = { page: '1' };

      jest.spyOn(model, 'find').mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockResolvedValue(mockProducts),
        }),
      } as any);

      const result = await productService.findAll(query);

      expect(model.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockProducts);
    });

    it('should apply keyword search when provided', async () => {
      const mockProducts = [mockProduct];
      const query = { page: '1', keyword: 'test' };

      jest.spyOn(model, 'find').mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockResolvedValue(mockProducts),
        }),
      } as any);

      const result = await productService.findAll(query);

      expect(model.find).toHaveBeenCalledWith({
        name: {
          $regex: 'test',
          $options: 'i',
        },
      });
      expect(result).toEqual(mockProducts);
    });

    it('should use default page 1 when no page provided', async () => {
      const mockProducts = [mockProduct];
      const query = {};

      jest.spyOn(model, 'find').mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockResolvedValue(mockProducts),
        }),
      } as any);

      const result = await productService.findAll(query);

      expect(model.find).toHaveBeenCalledWith({});
      expect(result).toEqual(mockProducts);
    });
  });

  describe('create', () => {
    it('should create and return a product with user association', async () => {
      const createProductDto = {
        name: 'New Product',
        description: 'New Description',
        price: 149.99,
        category: 'clothing',
        stock: 100,
      };

      const newProduct = {
        ...createProductDto,
        _id: 'new-id',
        user: mockUser._id,
      };

      jest.spyOn(model, 'create').mockResolvedValue(newProduct as any);

      const result = await productService.create(createProductDto, mockUser as any);

      expect(model.create).toHaveBeenCalledWith({
        ...createProductDto,
        user: mockUser._id,
      });
      expect(result).toEqual(newProduct);
    });
  });

  describe('updateById', () => {
    it('should update and return a product', async () => {
      const updateProductDto = {
        name: 'Updated Product',
        price: 199.99,
        stock: 25,
      };

      const updatedProduct = {
        ...mockProduct,
        ...updateProductDto,
      };

      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValue(updatedProduct);

      const result = await productService.updateById(mockProduct._id, updateProductDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockProduct._id,
        updateProductDto,
        {
          new: true,
          runValidators: true,
        },
      );
      expect(result).toEqual(updatedProduct);
    });

    it('should throw NotFoundException if product to update is not found', async () => {
      const updateProductDto = { name: 'Updated Product' };

      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValue(null);

      await expect(
        productService.updateById(mockProduct._id, updateProductDto),
      ).rejects.toThrow(NotFoundException);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        mockProduct._id,
        updateProductDto,
        {
          new: true,
          runValidators: true,
        },
      );
    });
  });

  describe('deleteById', () => {
  it('should delete and return a product', async () => {
    jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(mockProduct);

    const result = await productService.deleteById(mockProduct._id);

    expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockProduct._id);
    expect(result).toEqual(mockProduct);
  });

  it('should throw NotFoundException if product to delete is not found', async () => {
    jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(null);

    await expect(productService.deleteById(mockProduct._id)).rejects.toThrow(
      NotFoundException,
    );

    expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockProduct._id);
  });
});
});