import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../utils/test-app.util';
import { clearDatabase } from '../utils/test-db.util';
import { ADMIN_USER, REGULAR_USER } from '../fixtures/user.fixture';
import { PIKACHU, CHARIZARD, BULBASAUR } from '../fixtures/pokemon.fixture';
import {
  GEN1_RANKING,
  COMPETITIVE_RANKING,
  createRankingData,
} from '../fixtures/ranking.fixture';
import { seedUsers, seedPokemon, seedRankings } from '../helpers/seed.helper';
import { loginUser } from '../helpers/auth.helper';

describe('Rankings (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /rankings', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should create ranking with auto-set owner from JWT', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const rankingData = createRankingData({ title: 'My Test Ranking' });

      const response = await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send(rankingData)
        .expect(201);

      expect(response.body.title).toBe('My Test Ranking');
      expect(response.body).toHaveProperty('_id');
      expect(response.body.pokemon).toEqual([]);
      expect(response.body.zones).toEqual([]);
    });

    it('should create ranking with pokemon and zones', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD, BULBASAUR]);
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const rankingData = createRankingData({
        title: 'Gen 1 Favorites',
        pokemon: pokemon.map((p) => p._id.toString()),
        zones: [
          { name: 'S-Tier', interval: [1, 2], color: '#FF5733' },
          { name: 'A-Tier', interval: [3, 3], color: '#FFC300' },
        ],
      });

      const response = await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send(rankingData)
        .expect(201);

      expect(response.body.title).toBe('Gen 1 Favorites');
      expect(response.body.pokemon).toHaveLength(3);
      expect(response.body.zones).toHaveLength(2);
    });

    it('should reject overlapping zone intervals', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const rankingData = createRankingData({
        title: 'Invalid Zones',
        zones: [
          { name: 'S-Tier', interval: [1, 5], color: '#FF5733' },
          { name: 'A-Tier', interval: [5, 10], color: '#FFC300' }, // Overlaps at 5
        ],
      });

      await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send(rankingData)
        .expect(400);
    });

    it('should reject duplicate title for same user', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const rankingData = createRankingData({ title: 'My Favorites' });

      // Create first ranking
      await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send(rankingData)
        .expect(201);

      // Try to create second ranking with same title
      await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send(rankingData)
        .expect(409);
    });

    it('should allow same title for different users', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ADMIN_USER]);
      const user1Token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });
      const user2Token = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const rankingData = createRankingData({ title: 'Favorites' });

      // User 1 creates ranking
      await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${user1Token}`)
        .send(rankingData)
        .expect(201);

      // User 2 creates ranking with same title
      await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${user2Token}`)
        .send(rankingData)
        .expect(201);
    });

    it('should reject zone max interval > pokemon count', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]); // Only 2 pokemon
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const rankingData = createRankingData({
        title: 'Invalid Zone Range',
        pokemon: pokemon.map((p) => p._id.toString()),
        zones: [
          { name: 'S-Tier', interval: [1, 10], color: '#FF5733' }, // Max 10 > pokemon count 2
        ],
      });

      await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send(rankingData)
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      const rankingData = createRankingData();

      await request(app.getHttpServer())
        .post('/rankings')
        .send(rankingData)
        .expect(401);
    });
  });

  describe('PATCH /rankings/:id', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should allow owner to update ranking', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const rankings = await seedRankings(
        app,
        [createRankingData({ title: 'Original Title' })],
        users[0]._id.toString(),
      );
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .patch(`/rankings/${rankings[0]._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
    });

    it('should return 403 when admin tries to update (not owner)', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ADMIN_USER]);
      const rankings = await seedRankings(
        app,
        [createRankingData()],
        users[0]._id.toString(), // Owned by REGULAR_USER
      );
      const adminToken = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      await request(app.getHttpServer())
        .patch(`/rankings/${rankings[0]._id.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Update' })
        .expect(403);
    });

    it('should return 403 when non-owner tries to update', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ADMIN_USER]);
      const rankings = await seedRankings(
        app,
        [createRankingData()],
        users[0]._id.toString(), // Owned by REGULAR_USER
      );
      const otherUserToken = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      await request(app.getHttpServer())
        .patch(`/rankings/${rankings[0]._id.toString()}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);
    });

    it('should validate zone max interval <= pokemon count on update', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]);
      const rankings = await seedRankings(
        app,
        [
          createRankingData({
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
        ],
        users[0]._id.toString(),
      );
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .patch(`/rankings/${rankings[0]._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          zones: [{ name: 'S-Tier', interval: [1, 10], color: '#FF5733' }], // 10 > 2 pokemon
        })
        .expect(400);
    });

    it('should return 404 when ranking not found', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const fakeId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .patch(`/rankings/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /rankings/:id', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should allow owner to delete ranking', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const rankings = await seedRankings(
        app,
        [createRankingData()],
        users[0]._id.toString(),
      );
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .delete(`/rankings/${rankings[0]._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    });

    it('should return 403 when admin tries to delete (not owner)', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ADMIN_USER]);
      const rankings = await seedRankings(
        app,
        [createRankingData()],
        users[0]._id.toString(), // Owned by REGULAR_USER
      );
      const adminToken = await loginUser(app, {
        username: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      await request(app.getHttpServer())
        .delete(`/rankings/${rankings[0]._id.toString()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('should return 404 when ranking not found', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const fakeId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .delete(`/rankings/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('GET /users/:id (rankings integration)', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should include full rankings with populated pokemon', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]);
      const rankings = await seedRankings(
        app,
        [
          createRankingData({
            title: 'My Ranking',
            pokemon: pokemon.map((p) => p._id.toString()),
            zones: [{ name: 'S-Tier', interval: [1, 2], color: '#FF5733' }],
          }),
        ],
        users[0]._id.toString(),
      );
      const token = await loginUser(app, {
        username: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get(`/users/${users[0]._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.rankings).toHaveLength(1);
      expect(response.body.rankings[0].title).toBe('My Ranking');
      expect(response.body.rankings[0].pokemon).toHaveLength(2);
      expect(response.body.rankings[0].pokemon[0]).toHaveProperty('name');
      expect(response.body.rankings[0].pokemon[0]).toHaveProperty('image');
      expect(response.body.rankings[0].zones).toHaveLength(1);
    });
  });
});
