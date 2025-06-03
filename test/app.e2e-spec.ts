import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { Gender } from '../src/users/schemas/user.schema';

describe('App E2E', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth (e2e)', () => {
    const testUser: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '+5511999999999',
      cpf: '12345678901',
      user_ns: 'test_namespace',
      token_talkbi: 'test_token',
      gender: Gender.MALE
    };

    it('/auth/register (POST)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.name).toBe(testUser.name);
      expect(response.body).not.toHaveProperty('password');

      userId = response.body._id;
    });

    it('/auth/login (POST)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);

      accessToken = response.body.access_token;
    });

    it('/auth/login (POST) - Invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);
    });
  });

  describe('Users (e2e)', () => {
    it('/users (GET) - should require authentication', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });

    it('/users (GET) - should return users when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/users/:id (GET) - should return specific user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body._id).toBe(userId);
      expect(response.body.email).toBe('test@example.com');
    });

    it('/users/search (GET) - should find user by user_ns and token_talkbi', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/search')
        .query({
          user_ns: 'test_namespace',
          token_talkbi: 'test_token'
        })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.user_ns).toBe('test_namespace');
      expect(response.body.token_talkbi).toBe('test_token');
    });

    it('/users/:id (PATCH) - should update user', async () => {
      const updateData = {
        name: 'Updated Test User',
        phone: '+5511888888888'
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send(updateData)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.phone).toBe(updateData.phone);
    });

    it('/users/:id (DELETE) - should delete user', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify user is deleted
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('Validation (e2e)', () => {
    it('should validate required fields on user creation', async () => {
      const invalidUser = {
        name: 'Test User'
        // missing required fields
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('email'),
          expect.stringContaining('password')
        ])
      );
    });

    it('should validate email format', async () => {
      const invalidUser = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        phone: '+5511999999999',
        cpf: '12345678901',
        user_ns: 'test_namespace',
        token_talkbi: 'test_token',
        gender: Gender.MALE
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('email')])
      );
    });
  });
});
