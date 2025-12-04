import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ADMIN_USER, REGULAR_USER } from '../fixtures/user.fixture';
import { loginUser } from '../helpers/auth.helper';
import { seedUsers } from '../helpers/seed.helper';
import { createTestApp } from '../utils/test-app.util';
import { clearDatabase } from '../utils/test-db.util';
import { IMAGE_PROVIDER_TOKEN } from '../../src/upload/upload.module';
import { BaseImageProvider } from '../../src/upload/providers';

describe('Upload (e2e)', () => {
  let app: INestApplication;
  let imageProvider: BaseImageProvider;
  let originalIsConfigured: boolean;

  beforeAll(async () => {
    app = await createTestApp();
    imageProvider = app.get<BaseImageProvider>(IMAGE_PROVIDER_TOKEN);
    originalIsConfigured = imageProvider.isConfigured;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /upload/image', () => {
    beforeEach(async () => {
      await clearDatabase(app);
      jest.restoreAllMocks();
      // Reset isConfigured to original value
      Object.defineProperty(imageProvider, 'isConfigured', {
        value: originalIsConfigured,
        writable: true,
        configurable: true,
      });
    });

    const mockIsConfigured = (value: boolean) => {
      Object.defineProperty(imageProvider, 'isConfigured', {
        value,
        writable: true,
        configurable: true,
      });
    };

    it('should upload image when user is admin', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      // Spy on the provider's uploadImage method
      const uploadSpy = jest
        .spyOn(imageProvider, 'uploadImage')
        .mockResolvedValue({
          url: 'https://res.cloudinary.com/test/image/upload/pokemon/test.png',
          publicId: 'pokemon/test',
        });

      // Mock isConfigured to return true
      mockIsConfigured(true);

      const response = await request(app.getHttpServer())
        .post('/upload/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'test.png',
          contentType: 'image/png',
        })
        .expect(201);

      expect(response.body.url).toBe(
        'https://res.cloudinary.com/test/image/upload/pokemon/test.png',
      );
      expect(uploadSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          originalname: 'test.png',
          mimetype: 'image/png',
        }),
        'pokemon',
      );
    });

    it('should return 403 when user is not admin', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .post('/upload/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'test.png',
          contentType: 'image/png',
        })
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/upload/image')
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'test.png',
          contentType: 'image/png',
        })
        .expect(401);
    });

    it('should return 400 for invalid file type', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      mockIsConfigured(true);

      const response = await request(app.getHttpServer())
        .post('/upload/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-file-data'), {
          filename: 'test.txt',
          contentType: 'text/plain',
        })
        .expect(400);

      expect(response.body.message).toContain('Invalid file type');
    });

    it('should return 400 for file too large', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      mockIsConfigured(true);

      // Create a buffer larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

      const response = await request(app.getHttpServer())
        .post('/upload/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', largeBuffer, {
          filename: 'large.png',
          contentType: 'image/png',
        })
        .expect(400);

      expect(response.body.message).toContain('File too large');
    });

    it('should return 400 when no file provided', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      mockIsConfigured(true);

      const response = await request(app.getHttpServer())
        .post('/upload/image')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(response.body.message).toContain('No file provided');
    });

    it('should return 400 when provider not configured', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      // Mock isConfigured to return false
      mockIsConfigured(false);

      const response = await request(app.getHttpServer())
        .post('/upload/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'test.png',
          contentType: 'image/png',
        })
        .expect(400);

      expect(response.body.message).toContain('not configured');
    });

    it('should return 400 when provider upload fails', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      mockIsConfigured(true);
      jest
        .spyOn(imageProvider, 'uploadImage')
        .mockRejectedValue(new Error('Upload failed'));

      const response = await request(app.getHttpServer())
        .post('/upload/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'test.png',
          contentType: 'image/png',
        })
        .expect(400);

      expect(response.body.message).toContain('Failed to upload');
    });

    it('should accept different valid image types', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      mockIsConfigured(true);
      jest.spyOn(imageProvider, 'uploadImage').mockResolvedValue({
        url: 'https://example.com/image.jpg',
        publicId: 'test',
      });

      const imageTypes = [
        { filename: 'test.jpg', contentType: 'image/jpeg' },
        { filename: 'test.png', contentType: 'image/png' },
        { filename: 'test.gif', contentType: 'image/gif' },
        { filename: 'test.webp', contentType: 'image/webp' },
      ];

      for (const imageType of imageTypes) {
        await request(app.getHttpServer())
          .post('/upload/image')
          .set('Authorization', `Bearer ${token}`)
          .attach('file', Buffer.from('fake-image-data'), imageType)
          .expect(201);
      }
    });
  });

  describe('POST /upload/images', () => {
    beforeEach(async () => {
      await clearDatabase(app);
      jest.restoreAllMocks();
      // Reset isConfigured to original value
      Object.defineProperty(imageProvider, 'isConfigured', {
        value: originalIsConfigured,
        writable: true,
        configurable: true,
      });
    });

    const mockIsConfigured = (value: boolean) => {
      Object.defineProperty(imageProvider, 'isConfigured', {
        value,
        writable: true,
        configurable: true,
      });
    };

    it('should upload multiple images when user is admin', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      mockIsConfigured(true);
      jest.spyOn(imageProvider, 'uploadImage').mockResolvedValue({
        url: 'https://res.cloudinary.com/test/image/upload/pokemon/test.png',
        publicId: 'pokemon/test',
      });

      const response = await request(app.getHttpServer())
        .post('/upload/images')
        .set('Authorization', `Bearer ${token}`)
        .attach('files', Buffer.from('fake-image-data-1'), {
          filename: 'pikachu.png',
          contentType: 'image/png',
        })
        .attach('files', Buffer.from('fake-image-data-2'), {
          filename: 'charizard.png',
          contentType: 'image/png',
        })
        .expect(201);

      expect(response.body.results).toHaveLength(2);
      expect(response.body.successCount).toBe(2);
      expect(response.body.failedCount).toBe(0);
      expect(response.body.results[0]).toMatchObject({
        filename: 'pikachu.png',
        success: true,
        url: expect.any(String),
      });
      expect(response.body.results[1]).toMatchObject({
        filename: 'charizard.png',
        success: true,
        url: expect.any(String),
      });
    });

    it('should return 403 when user is not admin', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .post('/upload/images')
        .set('Authorization', `Bearer ${token}`)
        .attach('files', Buffer.from('fake-image-data'), {
          filename: 'test.png',
          contentType: 'image/png',
        })
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/upload/images')
        .attach('files', Buffer.from('fake-image-data'), {
          filename: 'test.png',
          contentType: 'image/png',
        })
        .expect(401);
    });

    it('should handle partial success with mixed valid and invalid files', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      mockIsConfigured(true);
      jest.spyOn(imageProvider, 'uploadImage').mockResolvedValue({
        url: 'https://res.cloudinary.com/test/image/upload/pokemon/test.png',
        publicId: 'pokemon/test',
      });

      const response = await request(app.getHttpServer())
        .post('/upload/images')
        .set('Authorization', `Bearer ${token}`)
        .attach('files', Buffer.from('fake-image-data'), {
          filename: 'valid.png',
          contentType: 'image/png',
        })
        .attach('files', Buffer.from('fake-file-data'), {
          filename: 'invalid.txt',
          contentType: 'text/plain',
        })
        .expect(201);

      expect(response.body.results).toHaveLength(2);
      expect(response.body.successCount).toBe(1);
      expect(response.body.failedCount).toBe(1);
      expect(response.body.results[0]).toMatchObject({
        filename: 'valid.png',
        success: true,
      });
      expect(response.body.results[1]).toMatchObject({
        filename: 'invalid.txt',
        success: false,
        error: expect.stringContaining('Invalid file type'),
      });
    });

    it('should return 400 when provider not configured', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      mockIsConfigured(false);

      const response = await request(app.getHttpServer())
        .post('/upload/images')
        .set('Authorization', `Bearer ${token}`)
        .attach('files', Buffer.from('fake-image-data'), {
          filename: 'test.png',
          contentType: 'image/png',
        })
        .expect(400);

      expect(response.body.message).toContain('not configured');
    });

    it('should handle provider upload failures gracefully', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      mockIsConfigured(true);
      jest
        .spyOn(imageProvider, 'uploadImage')
        .mockResolvedValueOnce({
          url: 'https://res.cloudinary.com/test/image/upload/pokemon/success.png',
          publicId: 'pokemon/success',
        })
        .mockRejectedValueOnce(new Error('Provider error'));

      const response = await request(app.getHttpServer())
        .post('/upload/images')
        .set('Authorization', `Bearer ${token}`)
        .attach('files', Buffer.from('fake-image-data-1'), {
          filename: 'success.png',
          contentType: 'image/png',
        })
        .attach('files', Buffer.from('fake-image-data-2'), {
          filename: 'fail.png',
          contentType: 'image/png',
        })
        .expect(201);

      expect(response.body.successCount).toBe(1);
      expect(response.body.failedCount).toBe(1);
      expect(response.body.results[0]).toMatchObject({
        filename: 'success.png',
        success: true,
      });
      expect(response.body.results[1]).toMatchObject({
        filename: 'fail.png',
        success: false,
        error: 'Failed to upload image',
      });
    });

    it('should reject files exceeding size limit', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      mockIsConfigured(true);
      jest.spyOn(imageProvider, 'uploadImage').mockResolvedValue({
        url: 'https://res.cloudinary.com/test/image/upload/pokemon/test.png',
        publicId: 'pokemon/test',
      });

      // Create a buffer larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

      const response = await request(app.getHttpServer())
        .post('/upload/images')
        .set('Authorization', `Bearer ${token}`)
        .attach('files', Buffer.from('fake-image-data'), {
          filename: 'small.png',
          contentType: 'image/png',
        })
        .attach('files', largeBuffer, {
          filename: 'large.png',
          contentType: 'image/png',
        })
        .expect(201);

      expect(response.body.successCount).toBe(1);
      expect(response.body.failedCount).toBe(1);
      expect(response.body.results[1]).toMatchObject({
        filename: 'large.png',
        success: false,
        error: expect.stringContaining('File too large'),
      });
    });

    it('should accept mix of different valid image types', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      mockIsConfigured(true);
      jest.spyOn(imageProvider, 'uploadImage').mockResolvedValue({
        url: 'https://res.cloudinary.com/test/image/upload/pokemon/test.png',
        publicId: 'pokemon/test',
      });

      const response = await request(app.getHttpServer())
        .post('/upload/images')
        .set('Authorization', `Bearer ${token}`)
        .attach('files', Buffer.from('fake-image-data'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })
        .attach('files', Buffer.from('fake-image-data'), {
          filename: 'test.png',
          contentType: 'image/png',
        })
        .attach('files', Buffer.from('fake-image-data'), {
          filename: 'test.gif',
          contentType: 'image/gif',
        })
        .attach('files', Buffer.from('fake-image-data'), {
          filename: 'test.webp',
          contentType: 'image/webp',
        })
        .expect(201);

      expect(response.body.results).toHaveLength(4);
      expect(response.body.successCount).toBe(4);
      expect(response.body.failedCount).toBe(0);
    });

    it('should return empty results when no files provided', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      mockIsConfigured(true);

      const response = await request(app.getHttpServer())
        .post('/upload/images')
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(response.body.results).toHaveLength(0);
      expect(response.body.successCount).toBe(0);
      expect(response.body.failedCount).toBe(0);
    });
  });
});
