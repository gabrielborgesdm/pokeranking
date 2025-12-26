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
        identifier: REGULAR_USER.username,
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
        identifier: REGULAR_USER.username,
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
        identifier: REGULAR_USER.username,
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

    it('should auto-generate unique title with (2) suffix for same user', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const rankingData = createRankingData({ title: 'My Favorites' });

      // Create first ranking
      const response1 = await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send(rankingData)
        .expect(201);

      expect(response1.body.title).toBe('My Favorites');

      // Create second ranking with same title - should get (2) suffix
      const response2 = await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send(rankingData)
        .expect(201);

      expect(response2.body.title).toBe('My Favorites (2)');
    });

    it('should generate sequential suffixes (2), (3), (4) for duplicate titles', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const rankingData = createRankingData({ title: 'Test' });

      // Create first ranking
      const response1 = await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send(rankingData)
        .expect(201);
      expect(response1.body.title).toBe('Test');

      // Create second - should get (2)
      const response2 = await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send(rankingData)
        .expect(201);
      expect(response2.body.title).toBe('Test (2)');

      // Create third - should get (3)
      const response3 = await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send(rankingData)
        .expect(201);
      expect(response3.body.title).toBe('Test (3)');

      // Create fourth - should get (4)
      const response4 = await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send(rankingData)
        .expect(201);
      expect(response4.body.title).toBe('Test (4)');
    });

    it('should allow same title for different users', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ADMIN_USER]);
      const user1Token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });
      const user2Token = await loginUser(app, {
        identifier: ADMIN_USER.username,
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

    it('should allow zone max interval > pokemon count', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]); // Only 2 pokemon
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const rankingData = createRankingData({
        title: 'Zone Beyond Pokemon Count',
        pokemon: pokemon.map((p) => p._id.toString()),
        zones: [
          { name: 'S-Tier', interval: [1, 10], color: '#FF5733' }, // Max 10 > pokemon count 2
        ],
      });

      await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send(rankingData)
        .expect(201);
    });

    it('should allow null end value for unbounded last zone', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const rankingData = createRankingData({
        title: 'Unbounded Zone',
        pokemon: pokemon.map((p) => p._id.toString()),
        zones: [
          { name: 'S-Tier', interval: [1, 5], color: '#FF5733' },
          { name: 'Rest', interval: [6, null], color: '#AAAAAA' }, // Unbounded last zone
        ],
      });

      await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send(rankingData)
        .expect(201);
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
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const response = await request(app.getHttpServer())
        .patch(`/rankings/${rankings[0]._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
    });

    it('should auto-generate unique title on update when title conflicts', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const rankings = await seedRankings(
        app,
        [
          createRankingData({ title: 'Foo' }),
          createRankingData({ title: 'Bar' }),
        ],
        users[0]._id.toString(),
      );
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      // Update "Bar" to "Foo" - should become "Foo (2)"
      const response = await request(app.getHttpServer())
        .patch(`/rankings/${rankings[1]._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Foo' })
        .expect(200);

      expect(response.body.title).toBe('Foo (2)');
    });

    it('should return 403 when admin tries to update (not owner)', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ADMIN_USER]);
      const rankings = await seedRankings(
        app,
        [createRankingData()],
        users[0]._id.toString(), // Owned by REGULAR_USER
      );
      const adminToken = await loginUser(app, {
        identifier: ADMIN_USER.username,
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
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      await request(app.getHttpServer())
        .patch(`/rankings/${rankings[0]._id.toString()}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ title: 'Unauthorized Update' })
        .expect(403);
    });

    it('should allow zone max interval > pokemon count on update', async () => {
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
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      await request(app.getHttpServer())
        .patch(`/rankings/${rankings[0]._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          zones: [{ name: 'S-Tier', interval: [1, 10], color: '#FF5733' }], // 10 > 2 pokemon - now allowed
        })
        .expect(200);
    });

    it('should return 404 when ranking not found', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
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
        identifier: REGULAR_USER.username,
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
        identifier: ADMIN_USER.username,
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
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const fakeId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .delete(`/rankings/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('GET /rankings/:id', () => {
    let rankingId: string;

    beforeEach(async () => {
      await clearDatabase(app);
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD, BULBASAUR]);
      const rankingData = createRankingData({
        title: 'Test Ranking',
        pokemon: pokemon.map((p) => p._id.toString()),
      });
      const response = await request(app.getHttpServer())
        .post('/rankings')
        .set('Authorization', `Bearer ${token}`)
        .send(rankingData);
      rankingId = response.body._id;
    });

    it('should return ranking by id without authentication (public)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/rankings/${rankingId}`)
        .expect(200);

      expect(response.body._id).toBe(rankingId);
      expect(response.body.title).toBe('Test Ranking');
    });

    it('should return 404 when ranking not found', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await request(app.getHttpServer())
        .get(`/rankings/${fakeId}`)
        .expect(404);
    });

    it('should return ranking with populated pokemon', async () => {
      const response = await request(app.getHttpServer())
        .get(`/rankings/${rankingId}`)
        .expect(200);

      expect(response.body.pokemon).toHaveLength(3);
      expect(response.body.pokemon[0]).toHaveProperty('name');
    });

    it('should return ranking with populated user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/rankings/${rankingId}`)
        .expect(200);

      expect(response.body.user).toHaveProperty('username');
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
        identifier: REGULAR_USER.username,
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

  describe('POST /rankings/:id/like', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should allow user to like a ranking', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ADMIN_USER]);
      const rankings = await seedRankings(
        app,
        [createRankingData()],
        users[0]._id.toString(),
      );
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .post(`/rankings/${rankings[0]._id.toString()}/like`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.isLiked).toBe(true);
      expect(response.body.likesCount).toBe(1);
    });

    it('should toggle like off when already liked', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ADMIN_USER]);
      const rankings = await seedRankings(
        app,
        [createRankingData()],
        users[0]._id.toString(),
      );
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      // Like
      await request(app.getHttpServer())
        .post(`/rankings/${rankings[0]._id.toString()}/like`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Unlike
      const response = await request(app.getHttpServer())
        .post(`/rankings/${rankings[0]._id.toString()}/like`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.isLiked).toBe(false);
      expect(response.body.likesCount).toBe(0);
    });

    it('should return 401 when not authenticated', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const rankings = await seedRankings(
        app,
        [createRankingData()],
        users[0]._id.toString(),
      );

      await request(app.getHttpServer())
        .post(`/rankings/${rankings[0]._id.toString()}/like`)
        .expect(401);
    });

    it('should return 404 when ranking not found', async () => {
      await seedUsers(app, [REGULAR_USER]);
      const token = await loginUser(app, {
        identifier: REGULAR_USER.username,
        password: REGULAR_USER.password,
      });

      const fakeId = '507f1f77bcf86cd799439011';

      await request(app.getHttpServer())
        .post(`/rankings/${fakeId}/like`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('GET /rankings', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should return paginated rankings sorted by likesCount by default', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]);
      await seedRankings(
        app,
        [
          createRankingData({
            title: 'Ranking 1',
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
          createRankingData({
            title: 'Ranking 2',
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
        ],
        users[0]._id.toString(),
      );

      const response = await request(app.getHttpServer())
        .get('/rankings')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(2);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(20);
    });

    it('should filter by search term (title)', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]);
      await seedRankings(
        app,
        [
          createRankingData({
            title: 'Fire Types',
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
          createRankingData({
            title: 'Water Types',
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
        ],
        users[0]._id.toString(),
      );

      const response = await request(app.getHttpServer())
        .get('/rankings')
        .query({ search: 'Fire' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Fire Types');
    });

    it('should filter by search term (username)', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ADMIN_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]);
      await seedRankings(
        app,
        [
          createRankingData({
            title: 'User1 Ranking',
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
        ],
        users[0]._id.toString(),
      );
      await seedRankings(
        app,
        [
          createRankingData({
            title: 'Admin Ranking',
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
        ],
        users[1]._id.toString(),
      );

      const response = await request(app.getHttpServer())
        .get('/rankings')
        .query({ search: REGULAR_USER.username })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].user.username).toBe(REGULAR_USER.username);
    });

    it('should sort by createdAt', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]);
      await seedRankings(
        app,
        [
          createRankingData({
            title: 'Older',
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
          createRankingData({
            title: 'Newer',
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
        ],
        users[0]._id.toString(),
      );

      const response = await request(app.getHttpServer())
        .get('/rankings')
        .query({ sortBy: 'createdAt', order: 'asc' })
        .expect(200);

      expect(response.body.data[0].title).toBe('Older');
      expect(response.body.data[1].title).toBe('Newer');
    });

    it('should not show empty rankings', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]);
      await seedRankings(
        app,
        [
          createRankingData({
            title: 'With Pokemon',
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
          createRankingData({ title: 'Empty Ranking' }), // No pokemon
        ],
        users[0]._id.toString(),
      );

      const response = await request(app.getHttpServer())
        .get('/rankings')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('With Pokemon');
    });

    it('should handle pagination correctly', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]);
      await seedRankings(
        app,
        [
          createRankingData({
            title: 'Ranking 1',
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
          createRankingData({
            title: 'Ranking 2',
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
          createRankingData({
            title: 'Ranking 3',
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
        ],
        users[0]._id.toString(),
      );

      const response = await request(app.getHttpServer())
        .get('/rankings')
        .query({ page: 1, limit: 2 })
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(3);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(2);
    });

    it('should include likesCount in response', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU]);
      await seedRankings(
        app,
        [
          createRankingData({
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
        ],
        users[0]._id.toString(),
      );

      const response = await request(app.getHttpServer())
        .get('/rankings')
        .expect(200);

      expect(response.body.data[0]).toHaveProperty('likesCount');
      expect(response.body.data[0].likesCount).toBe(0);
    });

    it('should include user info with only username in response', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU]);
      await seedRankings(
        app,
        [
          createRankingData({
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
        ],
        users[0]._id.toString(),
      );

      const response = await request(app.getHttpServer())
        .get('/rankings')
        .expect(200);

      expect(response.body.data[0].user).toHaveProperty('username');
      expect(response.body.data[0].user.username).toBe(REGULAR_USER.username);
      // Should not include other user fields
      expect(response.body.data[0].user).not.toHaveProperty('_id');
      expect(response.body.data[0].user).not.toHaveProperty('profilePic');
      expect(response.body.data[0].user).not.toHaveProperty('email');
    });

    it('should include ranking image from first pokemon', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const pokemon = await seedPokemon(app, [PIKACHU, CHARIZARD]);
      await seedRankings(
        app,
        [
          createRankingData({
            pokemon: pokemon.map((p) => p._id.toString()),
          }),
        ],
        users[0]._id.toString(),
      );

      const response = await request(app.getHttpServer())
        .get('/rankings')
        .expect(200);

      expect(response.body.data[0]).toHaveProperty('image');
      expect(response.body.data[0].image).toBe(PIKACHU.image);
    });
  });

  describe('GET /rankings/:id (like fields)', () => {
    beforeEach(async () => {
      await clearDatabase(app);
    });

    it('should include likesCount in response', async () => {
      const users = await seedUsers(app, [REGULAR_USER]);
      const rankings = await seedRankings(
        app,
        [createRankingData()],
        users[0]._id.toString(),
      );

      const response = await request(app.getHttpServer())
        .get(`/rankings/${rankings[0]._id.toString()}`)
        .expect(200);

      expect(response.body).toHaveProperty('likesCount');
      expect(response.body.likesCount).toBe(0);
    });

    it('should include isLiked=true for authenticated user who liked', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ADMIN_USER]);
      const rankings = await seedRankings(
        app,
        [createRankingData()],
        users[0]._id.toString(),
      );
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      // Like the ranking
      await request(app.getHttpServer())
        .post(`/rankings/${rankings[0]._id.toString()}/like`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Get ranking with auth
      const response = await request(app.getHttpServer())
        .get(`/rankings/${rankings[0]._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.isLiked).toBe(true);
    });

    it('should include isLiked=false for authenticated user who has not liked', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ADMIN_USER]);
      const rankings = await seedRankings(
        app,
        [createRankingData()],
        users[0]._id.toString(),
      );
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      const response = await request(app.getHttpServer())
        .get(`/rankings/${rankings[0]._id.toString()}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.isLiked).toBe(false);
    });

    it('should include likedBy array with user info', async () => {
      const users = await seedUsers(app, [REGULAR_USER, ADMIN_USER]);
      const rankings = await seedRankings(
        app,
        [createRankingData()],
        users[0]._id.toString(),
      );
      const token = await loginUser(app, {
        identifier: ADMIN_USER.username,
        password: ADMIN_USER.password,
      });

      // Like the ranking
      await request(app.getHttpServer())
        .post(`/rankings/${rankings[0]._id.toString()}/like`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .get(`/rankings/${rankings[0]._id.toString()}`)
        .expect(200);

      expect(response.body.likedBy).toHaveLength(1);
      expect(response.body.likedBy[0].username).toBe(ADMIN_USER.username);
    });
  });
});
