import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import request from 'supertest';
import { createTestApp } from '../utils/test-app.util';
import { clearDatabase } from '../utils/test-db.util';
import { REGULAR_USER } from '../fixtures/user.fixture';
import { seedUsers } from '../helpers/seed.helper';
import { loginUser } from '../helpers/auth.helper';
import { EmailService } from '../../src/email/email.service';

describe('Support (e2e)', () => {
  let app: INestApplication;
  let emailService: EmailService;
  let sendSupportNotificationSpy: jest.SpyInstance;

  beforeAll(async () => {
    app = await createTestApp();
    emailService = app.get(EmailService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /support', () => {
    beforeEach(async () => {
      await clearDatabase(app);
      sendSupportNotificationSpy = jest
        .spyOn(emailService, 'sendSupportNotification')
        .mockResolvedValue(true);
    });

    afterEach(() => {
      sendSupportNotificationSpy.mockRestore();
    });

    it('should create support message when authenticated', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/support')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'This is a valid feedback message for testing.' })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty(
        'message',
        'This is a valid feedback message for testing.',
      );
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/support')
        .send({ message: 'This is a valid feedback message for testing.' })
        .expect(401);
    });

    it('should return 400 when message is too short', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .post('/support')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'short' })
        .expect(400);
    });

    it('should return 400 when message is empty', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .post('/support')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: '' })
        .expect(400);
    });

    it('should return 400 when message is missing', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .post('/support')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);
    });

    it('should return 400 when message exceeds max length', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const longMessage = 'a'.repeat(2001);

      await request(app.getHttpServer())
        .post('/support')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: longMessage })
        .expect(400);
    });

    it('should store user info with the message', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .post('/support')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'Feedback message to verify user info storage.' })
        .expect(201);

      // Verify the message was stored with correct user info
      const connection = app.get(getConnectionToken());
      const savedMessage = await connection
        .collection('support_messages')
        .findOne({ message: 'Feedback message to verify user info storage.' });

      expect(savedMessage).not.toBeNull();
      expect(savedMessage.user.toString()).toBe(users[0]._id.toString());
      expect(savedMessage.username).toBe(REGULAR_USER.username);
      expect(savedMessage.email).toBe(REGULAR_USER.email.toLowerCase());
    });

    it('should accept message at minimum length (10 characters)', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/support')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: '1234567890' }) // Exactly 10 characters
        .expect(201);

      expect(response.body.message).toBe('1234567890');
    });

    it('should accept message at maximum length (2000 characters)', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const maxMessage = 'a'.repeat(2000);

      const response = await request(app.getHttpServer())
        .post('/support')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: maxMessage })
        .expect(201);

      expect(response.body.message).toBe(maxMessage);
    });

    it('should call email service to send support notification', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const testMessage = 'This is a test feedback message.';

      await request(app.getHttpServer())
        .post('/support')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: testMessage })
        .expect(201);

      expect(sendSupportNotificationSpy).toHaveBeenCalledTimes(1);
      expect(sendSupportNotificationSpy).toHaveBeenCalledWith(
        REGULAR_USER.username,
        REGULAR_USER.email.toLowerCase(),
        testMessage,
      );
    });

    it('should still succeed when email notification fails', async () => {
      sendSupportNotificationSpy.mockRejectedValue(new Error('Email failed'));

      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/support')
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'Message should still be saved.' })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.message).toBe('Message should still be saved.');
    });
  });
});
