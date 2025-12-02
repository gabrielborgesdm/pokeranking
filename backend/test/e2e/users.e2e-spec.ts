import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import request from 'supertest';
import { createTestApp } from '../utils/test-app.util';
import { clearDatabase } from '../utils/test-db.util';
import {
  REGULAR_USER,
  ANOTHER_USER,
  ADMIN_USER,
  createUserData,
} from '../fixtures/user.fixture';
import { PIKACHU, CHARIZARD, BULBASAUR } from '../fixtures/pokemon.fixture';
import { seedUsers, seedPokemon, seedRankings } from '../helpers/seed.helper';
import { loginUser } from '../helpers/auth.helper';
import { getInMemoryRedis } from '../mocks/in-memory-redis';

describe('Users (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /users (pagination, sorting, filtering)', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should return empty data array when no active users exist', async () => {
      // Create an inactive user
      await seedUsers(app, [{ ...REGULAR_USER, isActive: false }]);
      const activeUser = await seedUsers(app, [ADMIN_USER]);

      const token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Only the admin user (active) should be returned
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].username).toBe(ADMIN_USER.username);
    });

    it('should return only active users', async () => {
      const activeUser1 = createUserData({
        email: 'active1@test.com',
        username: 'active_user1',
        isActive: true,
      });
      const activeUser2 = createUserData({
        email: 'active2@test.com',
        username: 'active_user2',
        isActive: true,
      });
      const inactiveUser = createUserData({
        email: 'inactive@test.com',
        username: 'inactive_user',
        isActive: false,
      });

      await seedUsers(app, [activeUser1, activeUser2, inactiveUser]);

      const token = await loginUser(app, {
        username: activeUser1.username,
        password: activeUser1.password,
      });

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      const usernames = response.body.data.map((u: any) => u.username);
      expect(usernames).toContain('active_user1');
      expect(usernames).toContain('active_user2');
      expect(usernames).not.toContain('inactive_user');
    });

    it('should return default pagination values (page=1, limit=20)', async () => {
      await seedUsers(app, [REGULAR_USER]);

      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(20);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('data');
    });

    it('should support pagination (page, limit)', async () => {
      // Create 5 active users
      const users = Array.from({ length: 5 }, (_, i) =>
        createUserData({
          email: `user${i}@test.com`,
          username: `user_${i}`,
          isActive: true,
        }),
      );
      await seedUsers(app, users);

      const token = await loginUser(app, {
        username: users[0].username,
        password: users[0].password,
      });

      // Get page 1, limit 2
      const response = await request(app.getHttpServer())
        .get('/users?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(5);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(2);
    });

    it('should support page 2', async () => {
      // Create 5 users
      const users = Array.from({ length: 5 }, (_, i) =>
        createUserData({
          email: `user${i}@test.com`,
          username: `user_${i}`,
          isActive: true,
        }),
      );
      await seedUsers(app, users);

      const token = await loginUser(app, {
        username: users[0].username,
        password: users[0].password,
      });

      // Get page 2, limit 2
      const response = await request(app.getHttpServer())
        .get('/users?page=2&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.page).toBe(2);
    });

    it('should sort by highestCountOfRankedPokemon descending by default', async () => {
      const lowRanker = createUserData({
        email: 'low@test.com',
        username: 'low_ranker',
        isActive: true,
      });
      const highRanker = createUserData({
        email: 'high@test.com',
        username: 'high_ranker',
        isActive: true,
      });
      const users = await seedUsers(app, [lowRanker, highRanker]);

      // Update highestCountOfRankedPokemon directly
      const connection = app.get(getConnectionToken());
      await connection
        .collection('users')
        .updateOne(
          { _id: users[0]._id },
          { $set: { highestCountOfRankedPokemon: 5 } },
        );
      await connection
        .collection('users')
        .updateOne(
          { _id: users[1]._id },
          { $set: { highestCountOfRankedPokemon: 50 } },
        );

      const token = await loginUser(app, {
        username: lowRanker.username,
        password: lowRanker.password,
      });

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // High ranker should be first (desc order)
      expect(response.body.data[0].username).toBe('high_ranker');
      expect(response.body.data[0].highestCountOfRankedPokemon).toBe(50);
      expect(response.body.data[1].username).toBe('low_ranker');
      expect(response.body.data[1].highestCountOfRankedPokemon).toBe(5);
    });

    it('should sort by username ascending', async () => {
      await seedUsers(app, [
        createUserData({
          email: 'zebra@test.com',
          username: 'zebra_user',
          isActive: true,
        }),
        createUserData({
          email: 'alpha@test.com',
          username: 'alpha_user',
          isActive: true,
        }),
      ]);

      const token = await loginUser(app, {
        username: 'alpha_user',
        password: 'test123456',
      });

      const response = await request(app.getHttpServer())
        .get('/users?sortBy=username&order=asc')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data[0].username).toBe('alpha_user');
      expect(response.body.data[1].username).toBe('zebra_user');
    });

    it('should sort by username descending', async () => {
      await seedUsers(app, [
        createUserData({
          email: 'zebra@test.com',
          username: 'zebra_user',
          isActive: true,
        }),
        createUserData({
          email: 'alpha@test.com',
          username: 'alpha_user',
          isActive: true,
        }),
      ]);

      const token = await loginUser(app, {
        username: 'alpha_user',
        password: 'test123456',
      });

      const response = await request(app.getHttpServer())
        .get('/users?sortBy=username&order=desc')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data[0].username).toBe('zebra_user');
      expect(response.body.data[1].username).toBe('alpha_user');
    });

    it('should sort by createdAt ascending', async () => {
      // Create users with explicit timestamps
      const connection = app.get(getConnectionToken());

      const users = [
        createUserData({
          email: 'first@test.com',
          username: 'first_user',
          isActive: true,
        }),
        createUserData({
          email: 'second@test.com',
          username: 'second_user',
          isActive: true,
        }),
      ];

      const seeded = await seedUsers(app, users);

      // Update timestamps to ensure order
      await connection
        .collection('users')
        .updateOne(
          { _id: seeded[0]._id },
          { $set: { createdAt: new Date('2024-01-01') } },
        );
      await connection
        .collection('users')
        .updateOne(
          { _id: seeded[1]._id },
          { $set: { createdAt: new Date('2024-06-01') } },
        );

      const token = await loginUser(app, {
        username: users[0].username,
        password: users[0].password,
      });

      const response = await request(app.getHttpServer())
        .get('/users?sortBy=createdAt&order=asc')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data[0].username).toBe('first_user');
      expect(response.body.data[1].username).toBe('second_user');
    });

    it('should sort by createdAt descending', async () => {
      const connection = app.get(getConnectionToken());

      const users = [
        createUserData({
          email: 'first@test.com',
          username: 'first_user',
          isActive: true,
        }),
        createUserData({
          email: 'second@test.com',
          username: 'second_user',
          isActive: true,
        }),
      ];

      const seeded = await seedUsers(app, users);

      await connection
        .collection('users')
        .updateOne(
          { _id: seeded[0]._id },
          { $set: { createdAt: new Date('2024-01-01') } },
        );
      await connection
        .collection('users')
        .updateOne(
          { _id: seeded[1]._id },
          { $set: { createdAt: new Date('2024-06-01') } },
        );

      const token = await loginUser(app, {
        username: users[0].username,
        password: users[0].password,
      });

      const response = await request(app.getHttpServer())
        .get('/users?sortBy=createdAt&order=desc')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data[0].username).toBe('second_user');
      expect(response.body.data[1].username).toBe('first_user');
    });

    it('should filter by username (partial match, case-insensitive)', async () => {
      await seedUsers(app, [
        createUserData({
          email: 'john@test.com',
          username: 'john_doe',
          isActive: true,
        }),
        createUserData({
          email: 'jane@test.com',
          username: 'jane_smith',
          isActive: true,
        }),
        createUserData({
          email: 'johnny@test.com',
          username: 'johnny_cash',
          isActive: true,
        }),
      ]);

      const token = await loginUser(app, {
        username: 'john_doe',
        password: 'test123456',
      });

      const response = await request(app.getHttpServer())
        .get('/users?username=john')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      const usernames = response.body.data.map((u: any) => u.username);
      expect(usernames).toContain('john_doe');
      expect(usernames).toContain('johnny_cash');
      expect(usernames).not.toContain('jane_smith');
    });

    it('should filter by username case-insensitively', async () => {
      await seedUsers(app, [
        createUserData({
          email: 'john@test.com',
          username: 'John_Doe',
          isActive: true,
        }),
      ]);

      const token = await loginUser(app, {
        username: 'John_Doe',
        password: 'test123456',
      });

      const response = await request(app.getHttpServer())
        .get('/users?username=JOHN')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].username).toBe('John_Doe');
    });

    it('should return correct pagination metadata (total, page, limit)', async () => {
      const users = Array.from({ length: 7 }, (_, i) =>
        createUserData({
          email: `user${i}@test.com`,
          username: `user_${i}`,
          isActive: true,
        }),
      );
      await seedUsers(app, users);

      const token = await loginUser(app, {
        username: users[0].username,
        password: users[0].password,
      });

      const response = await request(app.getHttpServer())
        .get('/users?page=2&limit=3')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.total).toBe(7);
      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(3);
      expect(response.body.data).toHaveLength(3);
    });

    it('should include highestCountOfRankedPokemon in response', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);

      // Update highestCountOfRankedPokemon
      const connection = app.get(getConnectionToken());
      await connection
        .collection('users')
        .updateOne(
          { _id: users[0]._id },
          { $set: { highestCountOfRankedPokemon: 42 } },
        );

      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data[0]).toHaveProperty(
        'highestCountOfRankedPokemon',
        42,
      );
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  describe('GET /users - Cache behavior', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should cache the first page with default parameters', async () => {
      await seedUsers(app, [REGULAR_USER]);

      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // First request - should populate cache
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Check that cache was populated
      const redis = getInMemoryRedis();
      const cached = await redis.get('users:list:default');
      expect(cached).not.toBeNull();
      expect(cached).toHaveProperty('users');
      expect(cached).toHaveProperty('total');
    });

    it('should return cached data on subsequent requests with default params', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ANOTHER_USER]);

      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // First request - populates cache
      const firstResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(firstResponse.body.data).toHaveLength(2);

      // Add a new user directly to database (bypassing service)
      const connection = app.get(getConnectionToken());
      await connection.collection('users').insertOne({
        email: 'new@test.com',
        username: 'new_user',
        password: 'hashed',
        isActive: true,
        highestCountOfRankedPokemon: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Second request - should return cached data (still 2 users)
      const secondResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Should still return 2 users from cache
      expect(secondResponse.body.data).toHaveLength(2);
    });

    it('should not cache non-default queries (with filters)', async () => {
      await seedUsers(app, [REGULAR_USER]);

      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Request with username filter - should NOT cache
      await request(app.getHttpServer())
        .get('/users?username=regular')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Check that default cache key was not populated
      const redis = getInMemoryRedis();
      const cached = await redis.get('users:list:default');
      expect(cached).toBeNull();
    });

    it('should not cache non-default queries (with pagination)', async () => {
      await seedUsers(app, [REGULAR_USER]);

      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Request with page 2 - should NOT cache
      await request(app.getHttpServer())
        .get('/users?page=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const redis = getInMemoryRedis();
      const cached = await redis.get('users:list:default');
      expect(cached).toBeNull();
    });

    it('should not cache non-default queries (with different sort)', async () => {
      await seedUsers(app, [REGULAR_USER]);

      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Request with different sortBy - should NOT cache
      await request(app.getHttpServer())
        .get('/users?sortBy=username')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const redis = getInMemoryRedis();
      const cached = await redis.get('users:list:default');
      expect(cached).toBeNull();
    });

    it('should invalidate cache when highestCountOfRankedPokemon is updated', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD, BULBASAUR]);

      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // First request - populates cache
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify cache is populated
      const redis = getInMemoryRedis();
      let cached = await redis.get('users:list:default');
      expect(cached).not.toBeNull();

      // Create a ranking (should invalidate cache)
      await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My Ranking',
          pokemon: pokemon.map((p) => p._id.toString()),
        })
        .expect(201);

      // Cache should be invalidated
      cached = await redis.get('users:list:default');
      expect(cached).toBeNull();
    });
  });

  describe('highestCountOfRankedPokemon updates', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should update highestCountOfRankedPokemon when creating a ranking', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD, BULBASAUR]);

      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Verify initial count is 0
      let userResponse = await request(app.getHttpServer())
        .get(`/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(userResponse.body.highestCountOfRankedPokemon).toBe(0);

      // Create a ranking with 3 pokemon
      await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My Ranking',
          pokemon: pokemon.map((p) => p._id.toString()),
        })
        .expect(201);

      // Verify count is updated to 3
      userResponse = await request(app.getHttpServer())
        .get(`/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(userResponse.body.highestCountOfRankedPokemon).toBe(3);
    });

    it('should update highestCountOfRankedPokemon when updating a ranking with more pokemon', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD, BULBASAUR]);

      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Create a ranking with 1 pokemon
      const rankingResponse = await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My Ranking',
          pokemon: [pokemon[0]._id.toString()],
        })
        .expect(201);

      // Verify count is 1
      let userResponse = await request(app.getHttpServer())
        .get(`/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(userResponse.body.highestCountOfRankedPokemon).toBe(1);

      // Update ranking with 3 pokemon
      await request(app.getHttpServer())
        .patch(`/rankings/${rankingResponse.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          pokemon: pokemon.map((p) => p._id.toString()),
        })
        .expect(200);

      // Verify count is updated to 3
      userResponse = await request(app.getHttpServer())
        .get(`/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(userResponse.body.highestCountOfRankedPokemon).toBe(3);
    });

    it('should update highestCountOfRankedPokemon when deleting a ranking', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD, BULBASAUR]);

      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Create first ranking with 3 pokemon
      const ranking1Response = await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Big Ranking',
          pokemon: pokemon.map((p) => p._id.toString()),
        })
        .expect(201);

      // Create second ranking with 1 pokemon
      await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Small Ranking',
          pokemon: [pokemon[0]._id.toString()],
        })
        .expect(201);

      // Verify count is 3 (max of both)
      let userResponse = await request(app.getHttpServer())
        .get(`/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(userResponse.body.highestCountOfRankedPokemon).toBe(3);

      // Delete the big ranking
      await request(app.getHttpServer())
        .delete(`/rankings/${ranking1Response.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Verify count is now 1 (only small ranking remains)
      userResponse = await request(app.getHttpServer())
        .get(`/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(userResponse.body.highestCountOfRankedPokemon).toBe(1);
    });

    it('should set highestCountOfRankedPokemon to 0 when all rankings are deleted', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU]);

      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Create a ranking
      const rankingResponse = await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My Ranking',
          pokemon: [pokemon[0]._id.toString()],
        })
        .expect(201);

      // Verify count is 1
      let userResponse = await request(app.getHttpServer())
        .get(`/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(userResponse.body.highestCountOfRankedPokemon).toBe(1);

      // Delete the ranking
      await request(app.getHttpServer())
        .delete(`/rankings/${rankingResponse.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      // Verify count is now 0
      userResponse = await request(app.getHttpServer())
        .get(`/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(userResponse.body.highestCountOfRankedPokemon).toBe(0);
    });

    it('should not update highestCountOfRankedPokemon when updating ranking without changing pokemon count', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]);

      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Create a ranking with 2 pokemon
      const rankingResponse = await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'My Ranking',
          pokemon: pokemon.map((p) => p._id.toString()),
        })
        .expect(201);

      // Update ranking title only (no pokemon change)
      await request(app.getHttpServer())
        .patch(`/rankings/${rankingResponse.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Title',
        })
        .expect(200);

      // Verify count is still 2
      const userResponse = await request(app.getHttpServer())
        .get(`/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(userResponse.body.highestCountOfRankedPokemon).toBe(2);
    });

    it('should track the highest count across multiple rankings', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD, BULBASAUR]);

      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Create first ranking with 1 pokemon
      await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Small Ranking',
          pokemon: [pokemon[0]._id.toString()],
        })
        .expect(201);

      // Verify count is 1
      let userResponse = await request(app.getHttpServer())
        .get(`/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(userResponse.body.highestCountOfRankedPokemon).toBe(1);

      // Create second ranking with 3 pokemon
      await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Big Ranking',
          pokemon: pokemon.map((p) => p._id.toString()),
        })
        .expect(201);

      // Verify count is now 3 (highest)
      userResponse = await request(app.getHttpServer())
        .get(`/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(userResponse.body.highestCountOfRankedPokemon).toBe(3);

      // Create third ranking with 2 pokemon
      await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Medium Ranking',
          pokemon: [pokemon[0]._id.toString(), pokemon[1]._id.toString()],
        })
        .expect(201);

      // Verify count is still 3 (highest doesn't change)
      userResponse = await request(app.getHttpServer())
        .get(`/users/${users[0]._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(userResponse.body.highestCountOfRankedPokemon).toBe(3);
    });
  });
});
