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

  describe('logIn', () => {
    const loginDto = {
      email: 'ghulam1@gmail.com',
      password: '12345678',
    };

    it('should login user and return the token', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockUser);

      jest.spyOn(bcrypt as any, 'compare').mockResolvedValueOnce(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await authService.login(loginDto);

      expect(result).toEqual({ token });
    });

    it('should throw invalid email error', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(null);

      expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw invalid password error', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(bcrypt as any, 'compare').mockResolvedValueOnce(false);

      expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});