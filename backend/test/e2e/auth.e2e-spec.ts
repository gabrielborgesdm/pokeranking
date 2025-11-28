import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../utils/test-app.util';
import { clearDatabase } from '../utils/test-db.util';
import {
  ADMIN_USER,
  REGULAR_USER,
  createUserData,
} from '../fixtures/user.fixture';
import { seedUsers } from '../helpers/seed.helper';
import { loginUser } from '../helpers/auth.helper';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@test.com',
        username: 'newuser',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 when email is invalid', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should return 400 when password is too short', async () => {
      const userData = {
        email: 'test@test.com',
        username: 'testuser',
        password: '12345',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should return 400 when username is too short', async () => {
      const userData = {
        email: 'test@test.com',
        username: 'ab',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(400);
    });

    it('should return 409 when user with email already exists', async () => {
      await seedUsers(app, [REGULAR_USER]);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: REGULAR_USER.email,
          username: 'different_username',
          password: 'password123',
        })
        .expect(409);
    });

    it('should return 409 when user with username already exists', async () => {
      await seedUsers(app, [REGULAR_USER]);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'different@test.com',
          username: REGULAR_USER.username,
          password: 'password123',
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await clearDatabase(app);
      await seedUsers(app, [REGULAR_USER]);
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: REGULAR_USER.username,
          password: REGULAR_USER.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
    });

    it('should return 401 with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: REGULAR_USER.username,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 401 with non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('POST /auth/register-admin', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should register admin when authenticated as admin', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const adminToken = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const newAdminData = {
        email: 'newadmin@test.com',
        username: 'newadmin',
        password: 'admin123456',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register-admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newAdminData)
        .expect(201);

      expect(response.body.user.role).toBe('admin');
      expect(response.body).toHaveProperty('access_token');
    });

    it('should return 403 when authenticated as regular user', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const userToken = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const newAdminData = {
        email: 'newadmin@test.com',
        username: 'newadmin',
        password: 'admin123456',
      };

      await request(app.getHttpServer())
        .post('/auth/register-admin')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newAdminData)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      const newAdminData = {
        email: 'test@test.com',
        username: 'testadmin',
        password: 'admin123456',
      };

      await request(app.getHttpServer())
        .post('/auth/register-admin')
        .send(newAdminData)
        .expect(401);
    });
  });

  describe('GET /auth/profile', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should return user profile when authenticated', async () => {
      // Register a new user to get a valid token
      const userData = {
        email: 'profile@test.com',
        username: 'profileuser',
        password: 'profile123',
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(userData)
        .expect(201);

      const token = registerResponse.body.access_token;

      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.email).toBe(userData.email);
      expect(response.body.username).toBe(userData.username);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/auth/profile').expect(401);
    });
  });
});
