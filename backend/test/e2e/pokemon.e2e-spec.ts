import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../utils/test-app.util';
import { clearDatabase } from '../utils/test-db.util';
import { ADMIN_USER, REGULAR_USER } from '../fixtures/user.fixture';
import {
  PIKACHU,
  CHARIZARD,
  createPokemonData,
  ALL_POKEMON,
} from '../fixtures/pokemon.fixture';
import { seedUsers, seedPokemon } from '../helpers/seed.helper';
import { loginUser } from '../helpers/auth.helper';

describe('Pokemon (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /pokemon', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should create pokemon when user is admin', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const pokemonData = createPokemonData();

      const response = await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .send(pokemonData)
        .expect(201);

      expect(response.body.name).toBe(pokemonData.name);
      expect(response.body.image).toBe(pokemonData.image);
      expect(response.body).toHaveProperty('_id');
    });

    it('should return 403 when user is not admin', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const pokemonData = createPokemonData();

      await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .send(pokemonData)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      const pokemonData = createPokemonData();

      await request(app.getHttpServer())
        .post('/pokemon')
        .send(pokemonData)
        .expect(401);
    });

    it('should return 400 when data is invalid', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('POST /pokemon - Image Validation', () => {
    beforeEach(async () => {
      await clearDatabase(app);
      await seedUsers(app, [ADMIN_USER]);
    });

    it('should accept public image with valid filename', async () => {
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Pokemon',
          image: 'test.png',
        })
        .expect(201);

      expect(response.body.image).toBe('test.png');
    });

    it('should accept public image with different extensions', async () => {
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

      for (const ext of extensions) {
        const response = await request(app.getHttpServer())
          .post('/pokemon')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: `Test ${ext}`,
            image: `test.${ext}`,
          })
          .expect(201);

        expect(response.body.image).toBe(`test.${ext}`);
      }
    });

    it('should reject public image with path traversal', async () => {
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Pokemon',
          image: '../../../etc/passwd.png',
        })
        .expect(400);
    });

    it('should reject public image with invalid extension', async () => {
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Pokemon',
          image: 'test.exe',
        })
        .expect(400);
    });

    it('should reject public image with forward slash', async () => {
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Pokemon',
          image: 'folder/image.png',
        })
        .expect(400);
    });

    it('should accept hosted image from whitelisted domain (HTTPS)', async () => {
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Pokemon',
          image: 'https://res.cloudinary.com/pokemon/test.png',
        })
        .expect(201);

      expect(response.body.image).toContain('res.cloudinary.com');
    });

    it('should accept hosted image from whitelisted domain (HTTP)', async () => {
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Pokemon',
          image: 'http://res.cloudinary.com/pokemon/test.png',
        })
        .expect(201);

      expect(response.body.image).toContain('res.cloudinary.com');
    });

    it('should reject hosted image from non-whitelisted domain', async () => {
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Pokemon',
          image: 'https://evil.com/pokemon/test.png',
        })
        .expect(400);
    });

    it('should accept hosted image without file extension', async () => {
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Pokemon',
          image: 'https://res.cloudinary.com/pokemon/test',
        })
        .expect(201);

      expect(response.body.image).toBe(
        'https://res.cloudinary.com/pokemon/test',
      );
    });
  });

  describe('GET /pokemon', () => {
    beforeEach(async () => {
      await clearDatabase(app);
      await seedUsers(app, [REGULAR_USER]);
    });

    it('should return empty array when no pokemon exist', async () => {
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all pokemon when they exist', async () => {
      await seedPokemon(app, ALL_POKEMON);
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(ALL_POKEMON.length);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('image');
      expect(response.body[0]).toHaveProperty('_id');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/pokemon').expect(401);
    });
  });

  describe('GET /pokemon/:id', () => {
    let pokemonId: string;

    beforeEach(async () => {
      await clearDatabase(app);
      await seedUsers(app, [REGULAR_USER]);
      const [pokemon] = await seedPokemon(app, [PIKACHU]);
      pokemonId = pokemon._id.toString();
    });

    it('should return pokemon by id', async () => {
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get(`/pokemon/${pokemonId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.name).toBe(PIKACHU.name);
      expect(response.body._id).toBe(pokemonId);
    });

    it('should return 404 when pokemon not found', async () => {
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const fakeId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .get(`/pokemon/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/pokemon/${pokemonId}`)
        .expect(401);
    });
  });

  describe('PATCH /pokemon/:id', () => {
    let pokemonId: string;

    beforeEach(async () => {
      await clearDatabase(app);
      await seedUsers(app, [ADMIN_USER, REGULAR_USER]);
      const [pokemon] = await seedPokemon(app, [PIKACHU]);
      pokemonId = pokemon._id.toString();
    });

    it('should update pokemon when user is admin', async () => {
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const updateData = {
        name: 'Updated Pikachu',
        image: 'updated-pikachu.png',
      };

      const response = await request(app.getHttpServer())
        .patch(`/pokemon/${pokemonId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body._id).toBe(pokemonId);
    });

    it('should return 403 when user is not admin', async () => {
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const updateData = {
        name: 'Updated Pikachu',
        image: 'updated-pikachu.png',
      };

      await request(app.getHttpServer())
        .patch(`/pokemon/${pokemonId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(403);
    });

    it('should update pokemon image with different format', async () => {
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      // Update to hosted image format
      const updateToHosted = {
        image: 'https://res.cloudinary.com/pokemon/pikachu-new.png',
      };

      const response1 = await request(app.getHttpServer())
        .patch(`/pokemon/${pokemonId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateToHosted)
        .expect(200);

      expect(response1.body.image).toBe(updateToHosted.image);

      // Update back to public image format
      const updateToPublic = {
        image: 'pikachu-final.webp',
      };

      const response2 = await request(app.getHttpServer())
        .patch(`/pokemon/${pokemonId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateToPublic)
        .expect(200);

      expect(response2.body.image).toBe(updateToPublic.image);
    });

    it('should return 404 when pokemon not found', async () => {
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = {
        name: 'Updated Pokemon',
        image: 'updated-pokemon.png',
      };

      await request(app.getHttpServer())
        .patch(`/pokemon/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      const updateData = {
        name: 'Updated Pikachu',
        image: 'updated-pikachu.png',
      };

      await request(app.getHttpServer())
        .patch(`/pokemon/${pokemonId}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('DELETE /pokemon/:id', () => {
    let pokemonId: string;

    beforeEach(async () => {
      await clearDatabase(app);
      await seedUsers(app, [ADMIN_USER, REGULAR_USER]);
      const [pokemon] = await seedPokemon(app, [PIKACHU]);
      pokemonId = pokemon._id.toString();
    });

    it('should delete pokemon when user is admin', async () => {
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      await request(app.getHttpServer())
        .delete(`/pokemon/${pokemonId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/pokemon/${pokemonId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 403 when user is not admin', async () => {
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .delete(`/pokemon/${pokemonId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 404 when pokemon not found', async () => {
      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const fakeId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .delete(`/pokemon/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/pokemon/${pokemonId}`)
        .expect(401);
    });
  });
});
