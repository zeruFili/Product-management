import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest'; 
import { AppModule } from './../src/app.module';
import mongoose from 'mongoose';
import { Category } from '../src/product/schemas/product.schema';

describe('Product & Auth Controller (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });


 beforeAll(async () => { // Made async and fixed connection
    await mongoose.connect(process.env.DB_URI as string);
    if (mongoose.connection.db) {
        await mongoose.connection.db.dropDatabase();
    } else {
        console.error('Mongoose connection failed to establish a database reference.');
        // Optionally throw an error or handle the failure
    }
  },60000);
  afterAll(() => mongoose.disconnect());

  const user = {
    name: 'Ghulam',
    email: 'ghulam@gmail.com',
    password: '12345678',
  };

  const newProduct = {
     
    name: 'Test Product',
    description: 'Product Description',
    price: 99.99,
    category: Category.ELECTRONICS,
    stock: 50,

    
  };

  let jwtToken: string = '';
  let productCreated;

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

    it('(POST) - Login user', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: user.password })
        .expect(201)
        .then((res) => {
          expect(res.body.token).toBeDefined();
          jwtToken = res.body.token;
        });
    });
  });

  describe('Product', () => {
 

    it('(GET) - Get all Books', async () => {
      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .then((res) => {
          expect(res.body.length).toBe(1);
        });
    });

    it('(GET) - Get a Product by ID', async () => {
      return request(app.getHttpServer())
        .get(`/products/${productCreated?._id}`)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body._id).toEqual(productCreated._id);
        });
    });

    it('(PUT) - Update a Product by ID', async () => {
      const book = { name: 'Updated name' };
      return request(app.getHttpServer())
        .put(`/products/${productCreated?._id}`)     
        .set('Authorization', 'Bearer ' + jwtToken)
        .send(book)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
          expect(res.body.name).toEqual(book.name);
        });
    });

   
  });
});

