import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';

// Mock bcrypt at the top level
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let model: Model<User>;
  let jwtService: JwtService;

  const mockUser = {
    _id: '61c0ccf11d7bf83d153d7c06',
    name: 'Ghulam',
    email: 'ghulam1@gmail.com',
    password: 'hashedPassword',
  };

  const token = 'jwtToken';

  const mockModel = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    model = module.get<Model<User>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signUp', () => {
    const signUpDto = {
      name: 'Ghulam',
      email: 'ghulam1@gmail.com',
      password: '12345678',
    };

    it('should register the new user', async () => {
      // Setup mocks
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockModel.create.mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await authService.signUp(signUpDto);

      // Verify bcrypt.hash was called
      expect(bcrypt.hash).toHaveBeenCalledWith(signUpDto.password, 10);
      
      // Verify user creation was called
      expect(mockModel.create).toHaveBeenCalledWith({
        name: signUpDto.name,
        email: signUpDto.email,
        password: 'hashedPassword',
      });

      // Verify JWT token generation
      expect(jwtService.sign).toHaveBeenCalledWith({ id: mockUser._id });

      // Verify final result
      expect(result).toEqual({ token });
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'ghulam1@gmail.com',
      password: '12345678',
    };

    it('should login user and return the token', async () => {
      // Setup mocks
      mockModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await authService.login(loginDto);

      // Verify user lookup
      expect(mockModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });

      // Verify password comparison
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);

      // Verify JWT token generation
      expect(jwtService.sign).toHaveBeenCalledWith({ id: mockUser._id });

      // Verify final result
      expect(result).toEqual({ token });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      // Mock user not found
      mockModel.findOne.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto)).rejects.toThrow('Invalid email or password');
      
      expect(mockModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      // Mock user found but wrong password
      mockModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.login(loginDto)).rejects.toThrow('Invalid email or password');
      
      expect(mockModel.findOne).toHaveBeenCalledWith({ email: loginDto.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });
  });
});