import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  ALL_POKEMON,
  BULBASAUR,
  CHARIZARD,
  createPokemonData,
  PIKACHU,
} from '../fixtures/pokemon.fixture';
import { ADMIN_USER, REGULAR_USER } from '../fixtures/user.fixture';
import { loginUser } from '../helpers/auth.helper';
import { seedPokemon, seedUsers } from '../helpers/seed.helper';
import { createTestApp } from '../utils/test-app.util';
import { clearDatabase } from '../utils/test-db.util';

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
        identifier: ADMIN_USER.username,
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
        identifier: REGULAR_USER.username,
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
        identifier: ADMIN_USER.username,
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
        identifier: ADMIN_USER.username,
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

    it('should accept public image with .png extension', async () => {
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/pokemon')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test PNG',
          image: 'test.png',
        })
        .expect(201);

      expect(response.body.image).toBe('test.png');
    });

    it('should reject public image with non-png extensions', async () => {
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const invalidExtensions = ['jpg', 'jpeg', 'gif', 'webp'];

      for (const ext of invalidExtensions) {
        await request(app.getHttpServer())
          .post('/pokemon')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: `Test ${ext}`,
            image: `test.${ext}`,
          })
          .expect(400);
      }
    });

    it('should reject public image with path traversal', async () => {
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
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
        identifier: ADMIN_USER.username,
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
        identifier: ADMIN_USER.username,
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
        identifier: ADMIN_USER.username,
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
        identifier: ADMIN_USER.username,
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
        identifier: ADMIN_USER.username,
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
        identifier: ADMIN_USER.username,
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
        identifier: REGULAR_USER.username,
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
        identifier: REGULAR_USER.username,
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

  describe('GET /pokemon/search (pagination, filtering, sorting)', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should return empty data array when no pokemon exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/pokemon/search')
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should return default pagination values (page=1, limit=20)', async () => {
      await seedPokemon(app, [PIKACHU]);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search')
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(20);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('data');
    });

    it('should support pagination (page, limit)', async () => {
      const pokemon = Array.from({ length: 5 }, (_, i) =>
        createPokemonData({
          name: `Pokemon_${i}`,
          image: `pokemon_${i}.png`,
          types: ['Normal'],
        }),
      );
      await seedPokemon(app, pokemon);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search?page=1&limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(5);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(2);
    });

    it('should support page 2', async () => {
      const pokemon = Array.from({ length: 5 }, (_, i) =>
        createPokemonData({
          name: `Pokemon_${i}`,
          image: `pokemon_${i}.png`,
          types: ['Normal'],
        }),
      );
      await seedPokemon(app, pokemon);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search?page=2&limit=2')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.page).toBe(2);
    });

    it('should sort by name ascending by default', async () => {
      await seedPokemon(app, [
        createPokemonData({ name: 'Zebra', image: 'zebra.png' }),
        createPokemonData({ name: 'Alpha', image: 'alpha.png' }),
      ]);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search')
        .expect(200);

      expect(response.body.data[0].name).toBe('Alpha');
      expect(response.body.data[1].name).toBe('Zebra');
    });

    it('should sort by name descending', async () => {
      await seedPokemon(app, [
        createPokemonData({ name: 'Zebra', image: 'zebra.png' }),
        createPokemonData({ name: 'Alpha', image: 'alpha.png' }),
      ]);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search?sortBy=name&order=desc')
        .expect(200);

      expect(response.body.data[0].name).toBe('Zebra');
      expect(response.body.data[1].name).toBe('Alpha');
    });

    it('should sort by createdAt ascending', async () => {
      await seedPokemon(app, [
        createPokemonData({ name: 'First', image: 'first.png' }),
      ]);
      // Small delay to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));
      await seedPokemon(app, [
        createPokemonData({ name: 'Second', image: 'second.png' }),
      ]);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search?sortBy=createdAt&order=asc')
        .expect(200);

      expect(response.body.data[0].name).toBe('First');
      expect(response.body.data[1].name).toBe('Second');
    });

    it('should sort by createdAt descending', async () => {
      await seedPokemon(app, [
        createPokemonData({ name: 'First', image: 'first.png' }),
      ]);
      await new Promise((resolve) => setTimeout(resolve, 10));
      await seedPokemon(app, [
        createPokemonData({ name: 'Second', image: 'second.png' }),
      ]);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search?sortBy=createdAt&order=desc')
        .expect(200);

      expect(response.body.data[0].name).toBe('Second');
      expect(response.body.data[1].name).toBe('First');
    });

    it('should filter by name (partial match, case-insensitive)', async () => {
      await seedPokemon(app, [PIKACHU, CHARIZARD, BULBASAUR]);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search?name=pika')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Pikachu');
      expect(response.body.total).toBe(1);
    });

    it('should filter by name case-insensitively', async () => {
      await seedPokemon(app, [PIKACHU]);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search?name=PIKACHU')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Pikachu');
    });

    it('should filter by single type', async () => {
      await seedPokemon(app, [PIKACHU, CHARIZARD, BULBASAUR]);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search?types=Electric')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Pikachu');
    });

    it('should filter by multiple types (returns Pokemon with ANY of the types)', async () => {
      await seedPokemon(app, [PIKACHU, CHARIZARD, BULBASAUR]);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search?types=Electric,Fire')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      const names = response.body.data.map((p: any) => p.name);
      expect(names).toContain('Pikachu');
      expect(names).toContain('Charizard');
    });

    it('should filter by type that matches secondary type', async () => {
      await seedPokemon(app, [PIKACHU, CHARIZARD, BULBASAUR]);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search?types=Flying')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Charizard');
    });

    it('should combine name filter and type filter', async () => {
      await seedPokemon(app, [
        PIKACHU,
        CHARIZARD,
        createPokemonData({
          name: 'Pichu',
          image: 'pichu.png',
          types: ['Electric'],
        }),
      ]);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search?name=pi&types=Electric')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      const names = response.body.data.map((p: any) => p.name);
      expect(names).toContain('Pikachu');
      expect(names).toContain('Pichu');
      expect(names).not.toContain('Charizard');
    });

    it('should return correct pagination metadata (total, page, limit)', async () => {
      const pokemon = Array.from({ length: 7 }, (_, i) =>
        createPokemonData({
          name: `Pokemon_${i}`,
          image: `pokemon_${i}.png`,
        }),
      );
      await seedPokemon(app, pokemon);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search?page=2&limit=3')
        .expect(200);

      expect(response.body.total).toBe(7);
      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(3);
      expect(response.body.data).toHaveLength(3);
    });

    it('should include types in response', async () => {
      await seedPokemon(app, [CHARIZARD]);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search')
        .expect(200);

      expect(response.body.data[0]).toHaveProperty('types');
      expect(response.body.data[0].types).toEqual(['Fire', 'Flying']);
    });

    it('should be accessible without authentication (public endpoint)', async () => {
      await seedPokemon(app, [PIKACHU]);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(1);
    });

    it('should return 400 for limit exceeding maximum (100)', async () => {
      await request(app.getHttpServer())
        .get('/pokemon/search?limit=101')
        .expect(400);
    });

    it('should return empty array for page beyond results', async () => {
      await seedPokemon(app, [PIKACHU, CHARIZARD]);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search?page=100&limit=10')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.total).toBe(2);
    });

    it('should handle limit=1 correctly', async () => {
      await seedPokemon(app, [PIKACHU, CHARIZARD, BULBASAUR]);

      const response = await request(app.getHttpServer())
        .get('/pokemon/search?limit=1')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.total).toBe(3);
    });

    it('should return 400 for negative page value', async () => {
      await request(app.getHttpServer())
        .get('/pokemon/search?page=-1')
        .expect(400);
    });

    it('should return 400 for page=0', async () => {
      await request(app.getHttpServer())
        .get('/pokemon/search?page=0')
        .expect(400);
    });

    it('should return 400 for limit=0', async () => {
      await request(app.getHttpServer())
        .get('/pokemon/search?limit=0')
        .expect(400);
    });
  });

  describe('GET /pokemon/count', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should return 0 when no pokemon exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/pokemon/count')
        .expect(200);

      expect(response.body.totalPokemonCount).toBe(0);
    });

    it('should return correct count when pokemon exist', async () => {
      await seedPokemon(app, ALL_POKEMON);

      const response = await request(app.getHttpServer())
        .get('/pokemon/count')
        .expect(200);

      expect(response.body.totalPokemonCount).toBe(3);
    });

    it('should be accessible without authentication (public endpoint)', async () => {
      const response = await request(app.getHttpServer())
        .get('/pokemon/count')
        .expect(200);

      expect(response.body).toHaveProperty('totalPokemonCount');
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
        identifier: REGULAR_USER.username,
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
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const fakeId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .get(`/pokemon/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return pokemon when not authenticated (public endpoint)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/pokemon/${pokemonId}`)
        .expect(200);

      expect(response.body).toHaveProperty('name', 'Pikachu');
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
        identifier: ADMIN_USER.username,
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
        identifier: REGULAR_USER.username,
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
        identifier: ADMIN_USER.username,
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

      // Update back to public image format (only .png allowed)
      const updateToPublic = {
        image: 'pikachu-final.png',
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
        identifier: ADMIN_USER.username,
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
        identifier: ADMIN_USER.username,
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
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .delete(`/pokemon/${pokemonId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 404 when pokemon not found', async () => {
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
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

  describe('POST /pokemon/bulk', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should create multiple Pokemon when user is admin', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/pokemon/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          pokemon: [
            { name: 'Bulbasaur', image: 'bulbasaur.png' },
            { name: 'Charmander', image: 'charmander.png' },
            { name: 'Squirtle', image: 'squirtle.png' },
          ],
        })
        .expect(201);

      expect(response.body.results).toHaveLength(3);
      expect(response.body.successCount).toBe(3);
      expect(response.body.failedCount).toBe(0);
      expect(response.body.results[0]).toMatchObject({
        index: 0,
        name: 'Bulbasaur',
        success: true,
        pokemon: expect.objectContaining({
          name: 'Bulbasaur',
          image: 'bulbasaur.png',
        }),
      });
    });

    it('should return 403 when user is not admin', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .post('/pokemon/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          pokemon: [{ name: 'Pikachu', image: 'pikachu.png' }],
        })
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/pokemon/bulk')
        .send({
          pokemon: [{ name: 'Pikachu', image: 'pikachu.png' }],
        })
        .expect(401);
    });

    it('should handle partial success with some duplicates', async () => {
      await seedUsers(app, [ADMIN_USER]);
      await seedPokemon(app, [PIKACHU]);

      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/pokemon/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          pokemon: [
            { name: 'Pikachu', image: 'pikachu.png' }, // Already exists
            { name: 'Raichu', image: 'raichu.png' }, // New
          ],
        })
        .expect(201);

      expect(response.body.successCount).toBe(1);
      expect(response.body.failedCount).toBe(1);
      expect(response.body.results[0]).toMatchObject({
        index: 0,
        name: 'Pikachu',
        success: false,
        error: expect.stringContaining('already exists'),
        errorCode: 'NAME_EXISTS',
      });
      expect(response.body.results[1]).toMatchObject({
        index: 1,
        name: 'Raichu',
        success: true,
      });
    });

    it('should reject duplicates within the same batch', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/pokemon/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          pokemon: [
            { name: 'Eevee', image: 'eevee.png' },
            { name: 'Eevee', image: 'eevee2.png' }, // Duplicate within batch
          ],
        })
        .expect(201);

      expect(response.body.successCount).toBe(1);
      expect(response.body.failedCount).toBe(1);
      expect(response.body.results[0]).toMatchObject({
        index: 0,
        name: 'Eevee',
        success: true,
      });
      expect(response.body.results[1]).toMatchObject({
        index: 1,
        name: 'Eevee',
        success: false,
        errorCode: 'NAME_EXISTS',
      });
    });

    it('should return 400 for empty pokemon array', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      await request(app.getHttpServer())
        .post('/pokemon/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({ pokemon: [] })
        .expect(400);
    });

    it('should return 400 for invalid Pokemon data in array', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      await request(app.getHttpServer())
        .post('/pokemon/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          pokemon: [
            { name: '', image: 'invalid.png' }, // Empty name
          ],
        })
        .expect(400);
    });

    it('should validate image field for each Pokemon', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      await request(app.getHttpServer())
        .post('/pokemon/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          pokemon: [
            { name: 'ValidPokemon', image: '../../../path/traversal.png' },
          ],
        })
        .expect(400);
    });

    it('should create Pokemon with all optional fields', async () => {
      await seedUsers(app, [ADMIN_USER]);
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/pokemon/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          pokemon: [
            {
              name: 'Mewtwo',
              image: 'mewtwo.png',
              types: ['Psychic'],
              pokedexNumber: 150,
              species: 'Genetic Pokémon',
              height: 2.0,
              weight: 122.0,
              abilities: ['Pressure', 'Unnerve'],
              hp: 106,
              attack: 110,
              defense: 90,
              specialAttack: 154,
              specialDefense: 90,
              speed: 130,
              generation: 1,
            },
          ],
        })
        .expect(201);

      expect(response.body.successCount).toBe(1);
      expect(response.body.results[0].pokemon).toMatchObject({
        name: 'Mewtwo',
        types: ['Psychic'],
        pokedexNumber: 150,
        species: 'Genetic Pokémon',
        hp: 106,
        attack: 110,
        defense: 90,
        specialAttack: 154,
        specialDefense: 90,
        speed: 130,
        generation: 1,
      });
    });

    it('should return correct index for each result', async () => {
      await seedUsers(app, [ADMIN_USER]);
      await seedPokemon(app, [CHARIZARD]); // Pre-seed to cause failure

      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/pokemon/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          pokemon: [
            { name: 'Blastoise', image: 'blastoise.png' },
            { name: 'Charizard', image: 'charizard.png' }, // Already exists
            { name: 'Venusaur', image: 'venusaur.png' },
          ],
        })
        .expect(201);

      expect(response.body.results[0].index).toBe(0);
      expect(response.body.results[1].index).toBe(1);
      expect(response.body.results[2].index).toBe(2);
      expect(response.body.results[1].success).toBe(false);
    });

    it('should continue processing after failures', async () => {
      await seedUsers(app, [ADMIN_USER]);
      await seedPokemon(app, [BULBASAUR]);

      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post('/pokemon/bulk')
        .set('Authorization', `Bearer ${token}`)
        .send({
          pokemon: [
            { name: 'Bulbasaur', image: 'bulbasaur.png' }, // Fails
            { name: 'Ivysaur', image: 'ivysaur.png' }, // Should succeed
            { name: 'Venusaur', image: 'venusaur.png' }, // Should succeed
          ],
        })
        .expect(201);

      expect(response.body.successCount).toBe(2);
      expect(response.body.failedCount).toBe(1);
      expect(response.body.results[1].success).toBe(true);
      expect(response.body.results[2].success).toBe(true);
    });
  });
});
