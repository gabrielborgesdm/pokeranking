import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../utils/test-app.util';
import { clearDatabase } from '../utils/test-db.util';
import { hashPassword } from '../utils/password.util';
import { ADMIN_USER, REGULAR_USER } from '../fixtures/user.fixture';
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

      // With email verification enabled, no access_token is returned
      expect(response.body).not.toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.isActive).toBe(false); // Not active until email verified
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

    it('should login successfully with valid credentials (username)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: REGULAR_USER.username,
          password: REGULAR_USER.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
    });

    it('should login successfully with valid credentials (email)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: REGULAR_USER.email,
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
          identifier: REGULAR_USER.username,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 401 with non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: 'nonexistent',
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
        identifier: ADMIN_USER.username,
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
      // With email verification enabled, no access_token is returned
      expect(response.body).not.toHaveProperty('access_token');
    });

    it('should return 403 when authenticated as regular user', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const userToken = await loginUser(app, {
        identifier: REGULAR_USER.username,
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
      // Seed a verified user and login
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.email).toBe(REGULAR_USER.email);
      expect(response.body.username).toBe(REGULAR_USER.username);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/auth/profile').expect(401);
    });
  });

  describe('POST /auth/verify-email', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should verify email with valid code and return JWT', async () => {
      // Manually seed an unverified user with a verification code
      const connection = app.get('DatabaseConnection');
      const usersCollection = connection.collection('users');

      const verificationCode = '123456';
      const hashedPassword = await hashPassword('password123');

      await usersCollection.insertOne({
        email: 'verify@test.com',
        username: 'verifyuser',
        password: hashedPassword,
        role: 'member',
        isActive: false,
        emailVerificationCode: verificationCode,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({
          email: 'verify@test.com',
          code: verificationCode,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('verify@test.com');
      expect(response.body.message).toBe('Email verified successfully');

      // Verify user is now active in database
      const user = await usersCollection.findOne({ email: 'verify@test.com' });
      expect(user.isActive).toBe(true);
      expect(user.emailVerificationCode).toBeUndefined();
      expect(user.emailVerificationExpires).toBeUndefined();
    });

    it('should activate user account after verification', async () => {
      const connection = app.get('DatabaseConnection');
      const usersCollection = connection.collection('users');

      const verificationCode = '654321';
      const hashedPassword = await hashPassword('password123');

      await usersCollection.insertOne({
        email: 'activate@test.com',
        username: 'activateuser',
        password: hashedPassword,
        role: 'member',
        isActive: false,
        emailVerificationCode: verificationCode,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({
          email: 'activate@test.com',
          code: verificationCode,
        })
        .expect(200);

      // Verify activation
      const user = await usersCollection.findOne({
        email: 'activate@test.com',
      });
      expect(user.isActive).toBe(true);
    });

    it('should return 400 with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({
          email: 'invalid-email',
          code: '123456',
        })
        .expect(400);
    });

    it('should return 400 with code not 6 digits', async () => {
      await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({
          email: 'test@test.com',
          code: '12345',
        })
        .expect(400);
    });

    it('should return 400 with non-numeric code', async () => {
      await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({
          email: 'test@test.com',
          code: 'abcdef',
        })
        .expect(400);
    });

    it('should return 404 with incorrect code', async () => {
      const connection = app.get('DatabaseConnection');
      const usersCollection = connection.collection('users');
      const hashedPassword = await hashPassword('password123');

      await usersCollection.insertOne({
        email: 'wrong@test.com',
        username: 'wronguser',
        password: hashedPassword,
        role: 'member',
        isActive: false,
        emailVerificationCode: '111111',
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({
          email: 'wrong@test.com',
          code: '999999',
        })
        .expect(404);
    });

    it('should return 404 with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({
          email: 'nonexistent@test.com',
          code: '123456',
        })
        .expect(404);
    });
  });

  describe('POST /auth/resend-verification', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should resend verification code successfully', async () => {
      const connection = app.get('DatabaseConnection');
      const usersCollection = connection.collection('users');
      const hashedPassword = await hashPassword('password123');

      await usersCollection.insertOne({
        email: 'resend@test.com',
        username: 'resenduser',
        password: hashedPassword,
        role: 'member',
        isActive: false,
        emailVerificationCode: '111111',
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({
          email: 'resend@test.com',
        })
        .expect(200);

      expect(response.body.message).toBe('Verification code sent successfully');

      // Verify code was updated in database
      const user = await usersCollection.findOne({ email: 'resend@test.com' });
      expect(user.emailVerificationCode).toBeDefined();
      expect(user.emailVerificationCode).not.toBe('111111');
    });

    it('should generate new code (different from previous)', async () => {
      const connection = app.get('DatabaseConnection');
      const usersCollection = connection.collection('users');
      const hashedPassword = await hashPassword('password123');

      const oldCode = '222222';
      await usersCollection.insertOne({
        email: 'newcode@test.com',
        username: 'newcodeuser',
        password: hashedPassword,
        role: 'member',
        isActive: false,
        emailVerificationCode: oldCode,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({
          email: 'newcode@test.com',
        })
        .expect(200);

      const user = await usersCollection.findOne({ email: 'newcode@test.com' });
      expect(user.emailVerificationCode).not.toBe(oldCode);
    });

    it('should return 400 with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should return 400 if email already verified', async () => {
      await seedUsers(app, [REGULAR_USER]);

      await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({
          email: REGULAR_USER.email,
        })
        .expect(400);
    });

    it('should return 404 with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({
          email: 'notfound@test.com',
        })
        .expect(404);
    });
  });

  describe('POST /auth/forgot-password', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should send password reset email for existing user', async () => {
      await seedUsers(app, [REGULAR_USER]);

      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: REGULAR_USER.email,
        })
        .expect(200);

      expect(response.body.message).toContain(
        'If an account exists with this email',
      );

      // Verify reset token was created in database
      const connection = app.get('DatabaseConnection');
      const usersCollection = connection.collection('users');
      const user = await usersCollection.findOne({ email: REGULAR_USER.email });
      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetExpires).toBeDefined();
    });

    it('should return success even for non-existent email (prevent enumeration)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'nonexistent@test.com',
        })
        .expect(200);

      expect(response.body.message).toContain(
        'If an account exists with this email',
      );
    });

    it('should return 400 with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should overwrite existing reset token if requested again', async () => {
      await seedUsers(app, [REGULAR_USER]);

      // First request
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: REGULAR_USER.email,
        })
        .expect(200);

      const connection = app.get('DatabaseConnection');
      const usersCollection = connection.collection('users');
      const user1 = await usersCollection.findOne({
        email: REGULAR_USER.email,
      });
      const firstToken = user1.passwordResetToken;

      // Wait a bit to ensure different token
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Second request
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: REGULAR_USER.email,
        })
        .expect(200);

      const user2 = await usersCollection.findOne({
        email: REGULAR_USER.email,
      });
      const secondToken = user2.passwordResetToken;

      expect(secondToken).not.toBe(firstToken);
    });
  });

  describe('POST /auth/reset-password', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should reset password with valid token', async () => {
      const connection = app.get('DatabaseConnection');
      const usersCollection = connection.collection('users');
      const hashedPassword = await hashPassword('oldpassword');

      const resetToken = 'valid-reset-token-123';
      await usersCollection.insertOne({
        email: 'reset@test.com',
        username: 'resetuser',
        password: hashedPassword,
        role: 'member',
        isActive: true,
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          password: 'newpassword123',
        })
        .expect(200);

      expect(response.body.message).toBe('Password reset successfully');

      // Verify token was cleared
      const user = await usersCollection.findOne({ email: 'reset@test.com' });
      expect(user.passwordResetToken).toBeUndefined();
      expect(user.passwordResetExpires).toBeUndefined();
    });

    it('should allow login with new password after reset', async () => {
      const connection = app.get('DatabaseConnection');
      const usersCollection = connection.collection('users');
      const hashedPassword = await hashPassword('oldpassword');

      const resetToken = 'login-test-token';
      await usersCollection.insertOne({
        email: 'logintest@test.com',
        username: 'logintest',
        password: hashedPassword,
        role: 'member',
        isActive: true,
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Reset password
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          password: 'newpassword123',
        })
        .expect(200);

      // Try login with new password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: 'logintest',
          password: 'newpassword123',
        })
        .expect(200);
    });

    it('should prevent login with old password after reset', async () => {
      const connection = app.get('DatabaseConnection');
      const usersCollection = connection.collection('users');
      const hashedPassword = await hashPassword('oldpassword');

      const resetToken = 'prevent-old-token';
      await usersCollection.insertOne({
        email: 'preventold@test.com',
        username: 'preventold',
        password: hashedPassword,
        role: 'member',
        isActive: true,
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Reset password
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          password: 'newpassword123',
        })
        .expect(200);

      // Try login with old password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: 'preventold',
          password: 'oldpassword',
        })
        .expect(401);
    });

    it('should return 400 with password too short', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'any-token',
          password: '12345',
        })
        .expect(400);
    });

    it('should return 200 with expired token (prevent enumeration)', async () => {
      const connection = app.get('DatabaseConnection');
      const usersCollection = connection.collection('users');
      const hashedPassword = await hashPassword('password');

      const resetToken = 'expired-token';
      await usersCollection.insertOne({
        email: 'expired@test.com',
        username: 'expireduser',
        password: hashedPassword,
        role: 'member',
        isActive: true,
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          password: 'newpassword123',
        })
        .expect(200);
    });

    it('should return 200 with invalid token (prevent enumeration)', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'nonexistent-token',
          password: 'newpassword123',
        })
        .expect(200);
    });

    it('should prevent reusing same reset token', async () => {
      const connection = app.get('DatabaseConnection');
      const usersCollection = connection.collection('users');
      const hashedPassword = await hashPassword('password');

      const resetToken = 'reuse-token';
      await usersCollection.insertOne({
        email: 'reuse@test.com',
        username: 'reuseuser',
        password: hashedPassword,
        role: 'member',
        isActive: true,
        passwordResetToken: resetToken,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // First reset
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          password: 'newpassword123',
        })
        .expect(200);

      // Try to reuse same token
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          password: 'anotherpassword',
        })
        .expect(200);

      // Verify password was NOT changed again
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: 'reuseuser',
          password: 'newpassword123', // Should work
        })
        .expect(200);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: 'reuseuser',
          password: 'anotherpassword', // Should NOT work
        })
        .expect(401);
    });
  });
});
