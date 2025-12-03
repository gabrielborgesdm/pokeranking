import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import request from 'supertest';
import { createTestApp } from '../utils/test-app.util';
import { clearDatabase } from '../utils/test-db.util';
import { REGULAR_USER, ANOTHER_USER } from '../fixtures/user.fixture';
import { ALL_POKEMON, PIKACHU, CHARIZARD } from '../fixtures/pokemon.fixture';
import {
  BOX_PUBLIC,
  BOX_PRIVATE,
  BOX_WITH_POKEMON,
  BOX_PUBLIC_FIRE,
  createBoxData,
} from '../fixtures/box.fixture';
import { seedUsers, seedPokemon, seedBoxes } from '../helpers/seed.helper';
import { loginUser } from '../helpers/auth.helper';

describe('Boxes (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /boxes', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should create box successfully with minimal data (name only)', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const boxData = { name: 'My New Box' };

      const response = await request(app.getHttpServer())
        .post('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .send(boxData)
        .expect(201);

      expect(response.body.name).toBe(boxData.name);
      expect(response.body.isPublic).toBe(false);
      expect(response.body.pokemon).toEqual([]);
      expect(response.body.favoriteCount).toBe(0);
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should create box with pokemon array (valid IDs)', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const boxData = {
        name: 'My Pokemon Box',
        pokemon: [pokemon[0]._id.toString(), pokemon[1]._id.toString()],
      };

      const response = await request(app.getHttpServer())
        .post('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .send(boxData)
        .expect(201);

      expect(response.body.name).toBe(boxData.name);
      expect(response.body.pokemon).toHaveLength(2);
      expect(response.body.pokemon[0]._id).toBe(pokemon[0]._id.toString());
      expect(response.body.pokemon[1]._id).toBe(pokemon[1]._id.toString());
    });

    it('should create public box (isPublic: true)', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const boxData = {
        name: 'Public Collection',
        isPublic: true,
      };

      const response = await request(app.getHttpServer())
        .post('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .send(boxData)
        .expect(201);

      expect(response.body.name).toBe(boxData.name);
      expect(response.body.isPublic).toBe(true);
    });

    it('should create private box (isPublic: false, default)', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const boxData = {
        name: 'Private Collection',
        isPublic: false,
      };

      const response = await request(app.getHttpServer())
        .post('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .send(boxData)
        .expect(201);

      expect(response.body.isPublic).toBe(false);
    });

    it("should verify box is added to user's boxes array", async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const userId = users[0]._id.toString();
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const boxData = { name: 'Test Box' };

      const response = await request(app.getHttpServer())
        .post('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .send(boxData)
        .expect(201);

      // Verify box is in user's boxes list
      const boxesResponse = await request(app.getHttpServer())
        .get('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Should have default box + created box
      expect(boxesResponse.body).toHaveLength(2);
      expect(boxesResponse.body[1]._id).toBe(response.body._id);
    });

    it('should return 409 when box name already exists for user', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Create first box
      await seedBoxes(
        app,
        [{ name: 'Duplicate Name', isPublic: false }],
        users[0]._id.toString(),
      );

      // Try to create second box with same name
      const boxData = { name: 'Duplicate Name' };

      await request(app.getHttpServer())
        .post('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .send(boxData)
        .expect(409);
    });

    it('should allow duplicate box name for different users', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);

      // User 1 creates box
      await seedBoxes(
        app,
        [{ name: 'Same Name', isPublic: false }],
        users[0]._id.toString(),
      );

      // User 2 creates box with same name - should succeed
      const token2 = await loginUser(app, {
        identifier: ANOTHER_USER.username,
        password: ANOTHER_USER.password,
      });

      const boxData = { name: 'Same Name' };

      const response = await request(app.getHttpServer())
        .post('/boxes')
        .set('Authorization', `Bearer ${token2}`)
        .send(boxData)
        .expect(201);

      expect(response.body.name).toBe('Same Name');
    });

    it('should return 401 when not authenticated', async () => {
      const boxData = { name: 'Test Box' };

      await request(app.getHttpServer())
        .post('/boxes')
        .send(boxData)
        .expect(401);
    });

    it('should return 400 for invalid name (empty string)', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .post('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' })
        .expect(400);
    });

    it('should return 400 for name too long (>100 chars)', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const longName = 'a'.repeat(101);

      await request(app.getHttpServer())
        .post('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: longName })
        .expect(400);
    });

    it('should return 400 for invalid pokemon ID format (not valid MongoDB ObjectId)', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const boxData = {
        name: 'Test Box',
        pokemon: ['invalid-id', 'not-a-mongo-id'],
      };

      await request(app.getHttpServer())
        .post('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .send(boxData)
        .expect(400);
    });

    it('should return 400 for pokemon as non-array value', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const boxData = {
        name: 'Test Box',
        pokemon: 'not-an-array',
      };

      await request(app.getHttpServer())
        .post('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .send(boxData)
        .expect(400);
    });
  });

  describe('GET /boxes', () => {
    let userId: string;

    beforeEach(async () => {
      await clearDatabase(app);
      const users = await seedUsers(app, [REGULAR_USER]);
      userId = users[0]._id.toString();
    });

    it('should return default box when no boxes exist', async () => {
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]._id).toBe('default');
      expect(response.body[0].name).toBe('All Pokemon');
    });

    it("should return user's boxes + default box", async () => {
      await seedBoxes(app, [BOX_PRIVATE, BOX_WITH_POKEMON], userId);

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveLength(3); // default + 2 boxes
      expect(response.body[0]._id).toBe('default');
    });

    it('should verify default box is first in array', async () => {
      await seedBoxes(app, [BOX_PRIVATE], userId);

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body[0]._id).toBe('default');
    });

    it('should verify default box has ID "default"', async () => {
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body[0]._id).toBe('default');
    });

    it('should verify default box contains all pokemon', async () => {
      await seedPokemon(app, ALL_POKEMON);

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body[0].pokemon).toHaveLength(ALL_POKEMON.length);
    });

    it("should verify user's boxes are sorted by createdAt desc", async () => {
      await seedBoxes(
        app,
        [
          { ...BOX_PRIVATE, name: 'First Box' },
          { ...BOX_WITH_POKEMON, name: 'Second Box' },
        ],
        userId,
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Skip default box (index 0), check user boxes
      expect(response.body[1].name).toBe('Second Box'); // Most recent first
      expect(response.body[2].name).toBe('First Box');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/boxes').expect(401);
    });
  });

  describe('GET /boxes/community', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should return empty array when no public boxes exist', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes/community')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    it('should return public boxes from other users', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);

      // Another user creates public box
      await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes/community')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe(BOX_PUBLIC.name);
    });

    it("should exclude user's own boxes", async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);

      // Regular user creates public box
      await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC,
            ownerUsername: REGULAR_USER.username,
          },
        ],
        users[0]._id.toString(),
      );

      // Another user creates public box
      await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC_FIRE,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes/community')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Should only see another user's box
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe(BOX_PUBLIC_FIRE.name);
    });

    it('should exclude private boxes from other users', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);

      // Another user creates private box
      await seedBoxes(
        app,
        [
          {
            ...BOX_PRIVATE,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes/community')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toEqual([]);
    });

    it('should support pagination (page, limit)', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);

      // Create 5 public boxes from another user
      const boxes = Array.from({ length: 5 }, (_, i) => ({
        name: `Public Box ${i + 1}`,
        isPublic: true,
        ownerUsername: ANOTHER_USER.username,
      }));
      await seedBoxes(app, boxes, users[1]._id.toString());

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Get page 1, limit 2
      const response = await request(app.getHttpServer())
        .get('/boxes/community?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(5);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(2);
    });

    it('should default pagination (page=1, limit=20)', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);

      await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes/community')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(20);
    });

    it('should support sorting by createdAt (default desc)', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);

      const boxes = [
        {
          name: 'First Box',
          isPublic: true,
          ownerUsername: ANOTHER_USER.username,
        },
        {
          name: 'Second Box',
          isPublic: true,
          ownerUsername: ANOTHER_USER.username,
        },
      ];
      await seedBoxes(app, boxes, users[1]._id.toString());

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes/community')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Most recent first (desc)
      expect(response.body.data[0].name).toBe('Second Box');
      expect(response.body.data[1].name).toBe('First Box');
    });

    it('should support sorting by favoriteCount', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);

      const boxes = [
        {
          name: 'Popular Box',
          isPublic: true,
          ownerUsername: ANOTHER_USER.username,
        },
        {
          name: 'Less Popular Box',
          isPublic: true,
          ownerUsername: ANOTHER_USER.username,
        },
      ];
      const seededBoxes = await seedBoxes(app, boxes, users[1]._id.toString());

      // Manually update favoriteCount
      const connection = app.get(getConnectionToken());
      await connection
        .collection('boxes')
        .updateOne(
          { _id: seededBoxes[0]._id },
          { $set: { favoriteCount: 10 } },
        );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes/community?sortBy=favoriteCount&order=desc')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data[0].favoriteCount).toBe(10);
    });

    it('should support sorting order (asc/desc)', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);

      const boxes = [
        { name: 'A Box', isPublic: true, ownerUsername: ANOTHER_USER.username },
        { name: 'B Box', isPublic: true, ownerUsername: ANOTHER_USER.username },
      ];
      await seedBoxes(app, boxes, users[1]._id.toString());

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Ascending order
      const response = await request(app.getHttpServer())
        .get('/boxes/community?sortBy=createdAt&order=asc')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data[0].name).toBe('A Box');
      expect(response.body.data[1].name).toBe('B Box');
    });

    it('should support search filter (case-insensitive name match)', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);

      const boxes = [
        {
          name: 'Water Types',
          isPublic: true,
          ownerUsername: ANOTHER_USER.username,
        },
        {
          name: 'Fire Types',
          isPublic: true,
          ownerUsername: ANOTHER_USER.username,
        },
      ];
      await seedBoxes(app, boxes, users[1]._id.toString());

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes/community?search=water')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('Water Types');
    });

    it('should support ownerUsername filter', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);

      // Create third user
      const thirdUser = {
        email: 'third@test.com',
        username: 'third_user',
        password: 'third123456',
        role: 'member' as any,
        isActive: true,
      };
      const [user3] = await seedUsers(app, [thirdUser]);

      // Another user and third user create boxes
      await seedBoxes(
        app,
        [
          {
            name: 'Another Box',
            isPublic: true,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      await seedBoxes(
        app,
        [
          {
            name: 'Third Box',
            isPublic: true,
            ownerUsername: thirdUser.username,
          },
        ],
        user3._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get(`/boxes/community?ownerUsername=${ANOTHER_USER.username}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].ownerUsername).toBe(ANOTHER_USER.username);
    });

    it('should return correct pagination metadata (total, page, limit)', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);

      const boxes = Array.from({ length: 3 }, (_, i) => ({
        name: `Box ${i + 1}`,
        isPublic: true,
        ownerUsername: ANOTHER_USER.username,
      }));
      await seedBoxes(app, boxes, users[1]._id.toString());

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes/community?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.total).toBe(3);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(2);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/boxes/community').expect(401);
    });
  });

  describe('GET /boxes/:id', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should return box by ID when user is owner', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const boxes = await seedBoxes(
        app,
        [BOX_PRIVATE],
        users[0]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body._id).toBe(boxes[0]._id.toString());
      expect(response.body.name).toBe(BOX_PRIVATE.name);
    });

    it('should return public box when user is not owner', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);
      const boxes = await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body._id).toBe(boxes[0]._id.toString());
    });

    it('should verify pokemon are populated', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]);

      const boxes = await seedBoxes(
        app,
        [
          {
            name: 'Pokemon Box',
            pokemon: [pokemon[0]._id.toString(), pokemon[1]._id.toString()],
          },
        ],
        users[0]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.pokemon).toHaveLength(2);
      expect(response.body.pokemon[0]).toHaveProperty('name');
      expect(response.body.pokemon[0]).toHaveProperty('image');
    });

    it('should create box with valid and non-existent pokemon IDs, verify only valid ones are populated', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU]);

      // Create a valid but non-existent ObjectId
      const nonExistentId = '507f1f77bcf86cd799439011';

      const boxes = await seedBoxes(
        app,
        [
          {
            name: 'Mixed Pokemon Box',
            pokemon: [pokemon[0]._id.toString(), nonExistentId],
          },
        ],
        users[0]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Only the existing pokemon should be populated
      expect(response.body.pokemon).toHaveLength(1);
      expect(response.body.pokemon[0]._id).toBe(pokemon[0]._id.toString());
    });

    it('should return 404 for private box when user is not owner', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);
      const boxes = await seedBoxes(
        app,
        [
          {
            ...BOX_PRIVATE,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .get(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 404 for non-existent box ID', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const fakeId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .get(`/boxes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return default box with ID "default"', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes/default')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body._id).toBe('default');
      expect(response.body.name).toBe('All Pokemon');
    });

    it('should verify default box contains all pokemon', async () => {
      await seedUsers(app, [REGULAR_USER]);
      await seedPokemon(app, ALL_POKEMON);

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/boxes/default')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.pokemon).toHaveLength(ALL_POKEMON.length);
    });

    it('should return 401 when not authenticated', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const boxes = await seedBoxes(
        app,
        [BOX_PRIVATE],
        users[0]._id.toString(),
      );

      await request(app.getHttpServer())
        .get(`/boxes/${boxes[0]._id}`)
        .expect(401);
    });
  });

  describe('PATCH /boxes/:id', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should update box name when user is owner', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const boxes = await seedBoxes(
        app,
        [BOX_PRIVATE],
        users[0]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const updateData = { name: 'Updated Box Name' };

      const response = await request(app.getHttpServer())
        .patch(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
    });

    it('should update isPublic flag when user is owner', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const boxes = await seedBoxes(
        app,
        [BOX_PRIVATE],
        users[0]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const updateData = { isPublic: true };

      const response = await request(app.getHttpServer())
        .patch(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.isPublic).toBe(true);
    });

    it('should update pokemon array when user is owner', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]);
      const boxes = await seedBoxes(
        app,
        [BOX_PRIVATE],
        users[0]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const updateData = {
        pokemon: [pokemon[0]._id.toString(), pokemon[1]._id.toString()],
      };

      const response = await request(app.getHttpServer())
        .patch(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.pokemon).toHaveLength(2);
    });

    it('should update multiple fields at once', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const boxes = await seedBoxes(
        app,
        [BOX_PRIVATE],
        users[0]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const updateData = {
        name: 'New Name',
        isPublic: true,
      };

      const response = await request(app.getHttpServer())
        .patch(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('New Name');
      expect(response.body.isPublic).toBe(true);
    });

    it('should return 409 when new name conflicts with existing box', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const boxes = await seedBoxes(
        app,
        [
          { name: 'First Box', isPublic: false },
          { name: 'Second Box', isPublic: false },
        ],
        users[0]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Try to rename second box to first box's name
      const updateData = { name: 'First Box' };

      await request(app.getHttpServer())
        .patch(`/boxes/${boxes[1]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(409);
    });

    it('should allow updating to name that existed before (same box)', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const boxes = await seedBoxes(
        app,
        [BOX_PRIVATE],
        users[0]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Update to same name should succeed
      const updateData = { name: BOX_PRIVATE.name };

      const response = await request(app.getHttpServer())
        .patch(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(BOX_PRIVATE.name);
    });

    it('should return 403 when user is not owner', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);
      const boxes = await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const updateData = { name: 'Hacked Name' };

      await request(app.getHttpServer())
        .patch(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(403);
    });

    it('should return 404 for non-existent box ID', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'New Name' };

      await request(app.getHttpServer())
        .patch(`/boxes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const boxes = await seedBoxes(
        app,
        [BOX_PRIVATE],
        users[0]._id.toString(),
      );

      const updateData = { name: 'New Name' };

      await request(app.getHttpServer())
        .patch(`/boxes/${boxes[0]._id}`)
        .send(updateData)
        .expect(401);
    });

    it('should return 400 for invalid data (name too long, etc.)', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const boxes = await seedBoxes(
        app,
        [BOX_PRIVATE],
        users[0]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const longName = 'a'.repeat(101);

      await request(app.getHttpServer())
        .patch(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: longName })
        .expect(400);
    });

    it('should return 400 for invalid pokemon ID format in update', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const boxes = await seedBoxes(
        app,
        [BOX_PRIVATE],
        users[0]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const updateData = {
        pokemon: ['invalid-id', 'not-valid'],
      };

      await request(app.getHttpServer())
        .patch(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /boxes/:id', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should delete box when user is owner', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const boxes = await seedBoxes(
        app,
        [BOX_PRIVATE],
        users[0]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .delete(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    });

    it('should verify deletion (404 on subsequent GET)', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const boxes = await seedBoxes(
        app,
        [BOX_PRIVATE],
        users[0]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Delete
      await request(app.getHttpServer())
        .delete(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it("should verify box removed from user's boxes array", async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const boxes = await seedBoxes(
        app,
        [BOX_PRIVATE],
        users[0]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Delete
      await request(app.getHttpServer())
        .delete(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Check user's boxes list
      const response = await request(app.getHttpServer())
        .get('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Should only have default box
      expect(response.body).toHaveLength(1);
      expect(response.body[0]._id).toBe('default');
    });

    it('should return 403 when user is not owner', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);
      const boxes = await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .delete(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 404 for non-existent box ID', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const fakeId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .delete(`/boxes/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const boxes = await seedBoxes(
        app,
        [BOX_PRIVATE],
        users[0]._id.toString(),
      );

      await request(app.getHttpServer())
        .delete(`/boxes/${boxes[0]._id}`)
        .expect(401);
    });
  });

  describe('POST /boxes/:id/favorite', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should favorite public box successfully', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);
      const boxes = await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post(`/boxes/${boxes[0]._id}/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.name).toBe(BOX_PUBLIC.name);
    });

    it('should verify copy is created (different _id)', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);
      const boxes = await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post(`/boxes/${boxes[0]._id}/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body._id).not.toBe(boxes[0]._id.toString());
    });

    it('should verify original box favoriteCount incremented', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);
      const boxes = await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .post(`/boxes/${boxes[0]._id}/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Login as another user and check original box
      const token2 = await loginUser(app, {
        identifier: ANOTHER_USER.username,
        password: ANOTHER_USER.password,
      });

      const originalResponse = await request(app.getHttpServer())
        .get(`/boxes/${boxes[0]._id}`)
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(originalResponse.body.favoriteCount).toBe(1);
    });

    it('should verify copy is private by default (isPublic: false)', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);
      const boxes = await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post(`/boxes/${boxes[0]._id}/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.isPublic).toBe(false);
    });

    it('should verify pokemon array is cloned', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]);

      const boxes = await seedBoxes(
        app,
        [
          {
            name: 'Pokemon Box',
            isPublic: true,
            pokemon: [pokemon[0]._id.toString(), pokemon[1]._id.toString()],
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post(`/boxes/${boxes[0]._id}/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.pokemon).toHaveLength(2);
    });

    it('should generate unique name when base name exists (append " (2)")', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);

      // User already has a box with same name
      await seedBoxes(
        app,
        [
          {
            name: BOX_PUBLIC.name,
            isPublic: false,
          },
        ],
        users[0]._id.toString(),
      );

      // Another user's public box
      const boxes = await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post(`/boxes/${boxes[0]._id}/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.name).toBe(`${BOX_PUBLIC.name} (2)`);
    });

    it('should handle multiple name conflicts (append " (3)", " (4)", etc.)', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);

      // User already has boxes with same name and variants
      await seedBoxes(
        app,
        [
          { name: BOX_PUBLIC.name, isPublic: false },
          { name: `${BOX_PUBLIC.name} (2)`, isPublic: false },
          { name: `${BOX_PUBLIC.name} (3)`, isPublic: false },
        ],
        users[0]._id.toString(),
      );

      // Another user's public box
      const boxes = await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post(`/boxes/${boxes[0]._id}/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.name).toBe(`${BOX_PUBLIC.name} (4)`);
    });

    it("should verify new box added to user's boxes array", async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);
      const boxes = await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .post(`/boxes/${boxes[0]._id}/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Check user's boxes list
      const response = await request(app.getHttpServer())
        .get('/boxes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Should have default box + favorited box
      expect(response.body).toHaveLength(2);
    });

    it('should return 403 when trying to favorite own box', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const boxes = await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC,
            ownerUsername: REGULAR_USER.username,
          },
        ],
        users[0]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .post(`/boxes/${boxes[0]._id}/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('should return 404 for private box (treated as not found)', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);
      const boxes = await seedBoxes(
        app,
        [
          {
            ...BOX_PRIVATE,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[1]._id.toString(),
      );

      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .post(`/boxes/${boxes[0]._id}/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 404 for non-existent box ID', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const fakeId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .post(`/boxes/${fakeId}/favorite`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      const users = await seedUsers(app, [ANOTHER_USER]);
      const boxes = await seedBoxes(
        app,
        [
          {
            ...BOX_PUBLIC,
            ownerUsername: ANOTHER_USER.username,
          },
        ],
        users[0]._id.toString(),
      );

      await request(app.getHttpServer())
        .post(`/boxes/${boxes[0]._id}/favorite`)
        .expect(401);
    });
  });
});
