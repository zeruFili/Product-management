import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import mongoose from 'mongoose';
import { Category } from '../src/product/schemas/product.schema';

describe('Book & Auth Controller (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeAll(() => { Type '() => void' has no properties in common with type 'ConnectOptions'.
    mongoose.connect(process.env.DB_URI as string, function () {
      mongoose.connection.db.dropDatabase();
    }); 'mongoose.connection.db' is possibly 'undefined'
  });

  afterAll(() => mongoose.disconnect());

  const user = {
    name: 'Ghulam',
    email: 'ghulam@gmail.com',
    password: '12345678',
  };

  const newBook = {
    title: 'New Book',
    description: 'Book Description',
    author: 'Author',
    price: 100,
    category: Category.TOYS,
  };

  let jwtToken: string = '';
  let bookCreated;

  describe('Auth', () => {
    it('(POST) - Register a new user', async () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(user)
        .expect(201)
        .then((res) => {
          expect(res.body.token).toBeDefined();
        });
    });

  
  });

  
});