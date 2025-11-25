import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PassportModule } from '@nestjs/passport';
import { CreateProductDto } from './dto/create-product.dto';
import { User } from '../auth/schemas/user.schema';
import { UpdateProductDto } from './dto/update-product.dto';

describe('ProductController', () => {
  let productService: ProductService;
  let productController: ProductController;

  const mockProduct = {
    _id: '61c0ccf11d7bf83d153d7c06',
    user: '61c0ccf11d7bf83d153d7c06',
    name: 'Test Product',
    description: 'Product Description',
    price: 99.99,
    category: 'electronics',
    stock: 50,
  };

  const mockUser = {
    _id: '61c0ccf11d7bf83d153d7c06',
    name: 'Test User',
    email: 'test@example.com',
  };

  const mockProductService = {
    findAll: jest.fn().mockResolvedValueOnce([mockProduct]),
    create: jest.fn(),
    findById: jest.fn().mockResolvedValueOnce(mockProduct),
    updateById: jest.fn(),
    deleteById: jest.fn().mockResolvedValueOnce(mockProduct),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productController = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(productController).toBeDefined();
  });

  describe('getAllProducts', () => {
    it('should get all products', async () => {
      const result = await productController.getAllProducts({
        page: '1',
        keyword: 'test',
      });

      expect(productService.findAll).toHaveBeenCalledWith({
        page: '1',
        keyword: 'test',
      });
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'New Product',
        description: 'Product Description',
        price: 149.99,
        category: 'clothing',
        stock: 100,
      };

      mockProductService.create = jest.fn().mockResolvedValueOnce(mockProduct);

      const result = await productController.createProduct(
        newProduct as CreateProductDto,
        { user: mockUser } as any,
      );

      expect(productService.create).toHaveBeenCalledWith(newProduct, mockUser);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('getProductById', () => {
    it('should get a product by ID', async () => {
      const result = await productController.getProduct(mockProduct._id);

      expect(productService.findById).toHaveBeenCalledWith(mockProduct._id);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('updateProduct', () => {
    it('should update product by its ID', async () => {
      const updatedProduct = { ...mockProduct, name: 'Updated Product' };
      const product = { name: 'Updated Product' };

      mockProductService.updateById = jest.fn().mockResolvedValueOnce(updatedProduct);

      const result = await productController.updateProduct(
        mockProduct._id,
        product as UpdateProductDto,
      );

      expect(productService.updateById).toHaveBeenCalledWith(
        mockProduct._id,
        product,
      );
      expect(result).toEqual(updatedProduct);
    });
  });


});