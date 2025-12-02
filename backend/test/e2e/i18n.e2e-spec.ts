import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../utils/test-app.util';
import { clearDatabase } from '../utils/test-db.util';
import {
  REGULAR_USER,
  ANOTHER_USER,
  ADMIN_USER,
} from '../fixtures/user.fixture';
import { PIKACHU } from '../fixtures/pokemon.fixture';
import { seedUsers, seedPokemon } from '../helpers/seed.helper';
import { loginUser } from '../helpers/auth.helper';

describe('I18n - Internationalization (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Errors', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should return English error for invalid credentials (default)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'nonexistent', password: 'wrongpassword' })
        .expect(401);

      expect(response.body.message).toBe('Invalid username or password');
    });

    it('should return Portuguese error for invalid credentials with Accept-Language: pt-BR', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'nonexistent', password: 'wrongpassword' })
        .set('Accept-Language', 'pt-BR')
        .expect(401);

      expect(response.body.message).toBe('Nome de usuário ou senha inválidos');
    });

    it('should return Portuguese error using ?lang=pt-BR query parameter', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login?lang=pt-BR')
        .send({ username: 'nonexistent', password: 'wrongpassword' })
        .expect(401);

      expect(response.body.message).toBe('Nome de usuário ou senha inválidos');
    });

    it('should return English error for unverified email (default)', async () => {
      // Create an unverified user (isActive: false)
      await seedUsers(app, [{ ...REGULAR_USER, isActive: false }]);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: REGULAR_USER.username,
          password: REGULAR_USER.password,
        })
        .expect(401);

      expect(response.body.message).toBe('Please verify your email to login');
    });

    it('should return Portuguese error for unverified email with Accept-Language: pt-BR', async () => {
      await seedUsers(app, [{ ...REGULAR_USER, isActive: false }]);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: REGULAR_USER.username,
          password: REGULAR_USER.password,
        })
        .set('Accept-Language', 'pt-BR')
        .expect(401);

      expect(response.body.message).toBe(
        'Por favor, verifique seu email para fazer login',
      );
    });
  });

  describe('User Errors', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should return English error for user not found (default)', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe(
        'User with ID 507f1f77bcf86cd799439011 not found',
      );
    });

    it('should return Portuguese error for user not found with Accept-Language: pt-BR', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/users/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept-Language', 'pt-BR')
        .expect(404);

      expect(response.body.message).toBe(
        'Usuário com ID 507f1f77bcf86cd799439011 não encontrado',
      );
    });

    it('should return English error for duplicate email (default)', async () => {
      await seedUsers(app, [REGULAR_USER, ADMIN_USER]);
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: REGULAR_USER.email,
          username: 'newuser',
          password: 'password123',
        })
        .expect(409);

      expect(response.body.message).toBe(
        `User with email "${REGULAR_USER.email}" already exists`,
      );
    });

    it('should return Portuguese error for duplicate email with Accept-Language: pt-BR', async () => {
      await seedUsers(app, [REGULAR_USER, ADMIN_USER]);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: REGULAR_USER.email,
          username: 'newuser',
          password: 'password123',
        })
        .set('Accept-Language', 'pt-BR')
        .expect(409);

      expect(response.body.message).toBe(
        `Usuário com email "${REGULAR_USER.email}" já existe`,
      );
    });

    it('should return English error for cannot update others profile (default)', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const anotherUserId = users[1]._id.toString();

      const response = await request(app.getHttpServer())
        .patch(`/users/${anotherUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ username: 'hackedusername' })
        .expect(403);

      expect(response.body.message).toBe(
        'You can only update your own profile',
      );
    });

    it('should return Portuguese error for cannot update others profile with Accept-Language: pt-BR', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const anotherUserId = users[1]._id.toString();

      const response = await request(app.getHttpServer())
        .patch(`/users/${anotherUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .set('Accept-Language', 'pt-BR')
        .send({ username: 'hackedusername' })
        .expect(403);

      expect(response.body.message).toBe(
        'Você só pode atualizar seu próprio perfil',
      );
    });
  });

  describe('Pokemon Errors', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should return English error for pokemon not found (default)', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/pokemon/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe(
        'Pokemon with ID 507f1f77bcf86cd799439011 not found',
      );
    });

    it('should return Portuguese error for pokemon not found with Accept-Language: pt-BR', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/pokemon/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept-Language', 'pt-BR')
        .expect(404);

      expect(response.body.message).toBe(
        'Pokemon com ID 507f1f77bcf86cd799439011 não encontrado',
      );
    });

    it('should return English error for duplicate pokemon name (default)', async () => {
      await seedUsers(app, [ADMIN_USER]);
      await seedPokemon(app, [PIKACHU]);
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: PIKACHU.name, image: 'another-pikachu.png' })
        .expect(409);

      expect(response.body.message).toBe(
        `Pokemon with name "${PIKACHU.name}" already exists`,
      );
    });

    it('should return Portuguese error for duplicate pokemon name with Accept-Language: pt-BR', async () => {
      await seedUsers(app, [ADMIN_USER]);
      await seedPokemon(app, [PIKACHU]);
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept-Language', 'pt-BR')
        .send({ name: PIKACHU.name, image: 'another-pikachu.png' })
        .expect(409);

      expect(response.body.message).toBe(
        `Pokemon com nome "${PIKACHU.name}" já existe`,
      );
    });
  });

  describe('Ranking Errors', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should return English error for ranking not found (default)', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .patch('/rankings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.message).toBe(
        'Ranking with ID 507f1f77bcf86cd799439011 not found',
      );
    });

    it('should return Portuguese error for ranking not found with Accept-Language: pt-BR', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .patch('/rankings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept-Language', 'pt-BR')
        .send({ title: 'Updated Title' })
        .expect(404);

      expect(response.body.message).toBe(
        'Ranking com ID 507f1f77bcf86cd799439011 não encontrado',
      );
    });
  });

  describe('Box Errors', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should return English error for box not found (default)', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.message).toBe(
        'Box with ID 507f1f77bcf86cd799439011 not found',
      );
    });

    it('should return Portuguese error for box not found with Accept-Language: pt-BR', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .set('Accept-Language', 'pt-BR')
        .expect(404);

      expect(response.body.message).toBe(
        'Box com ID 507f1f77bcf86cd799439011 não encontrada',
      );
    });
  });

  describe('Language Fallback', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should fallback to English for unsupported language', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'nonexistent', password: 'wrongpassword' })
        .set('Accept-Language', 'fr-FR') // French - not supported
        .expect(401);

      // Should fallback to English
      expect(response.body.message).toBe('Invalid username or password');
    });

    it('should use pt-BR for Accept-Language: pt', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'nonexistent', password: 'wrongpassword' })
        .set('Accept-Language', 'pt')
        .expect(401);

      // Should use Portuguese
      expect(response.body.message).toBe('Nome de usuário ou senha inválidos');
    });

    it('should handle complex Accept-Language header with quality values', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'nonexistent', password: 'wrongpassword' })
        .set('Accept-Language', 'fr-FR, pt-BR;q=0.9, en;q=0.8')
        .expect(401);

      // Should prefer pt-BR over en since fr-FR is not supported
      expect(response.body.message).toBe('Nome de usuário ou senha inválidos');
    });
  });
});
