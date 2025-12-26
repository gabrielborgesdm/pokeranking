import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserFixtureData } from '../fixtures/user.fixture';
import { PokemonFixtureData } from '../fixtures/pokemon.fixture';
import { RankingFixtureData } from '../fixtures/ranking.fixture';
import { BoxFixtureData } from '../fixtures/box.fixture';

/**
 * Gets the mongoose connection from the NestJS app
 */
function getConnection(app: INestApplication): Connection {
  return app.get(getConnectionToken());
}

/**
 * Seeds users into the test database
 * Hashes passwords using bcrypt (matching UsersService implementation)
 * @param app - NestJS application instance
 * @param users - Array of user fixture data
 * @returns Array of created user documents
 */
export async function seedUsers(
  app: INestApplication,
  users: UserFixtureData[],
): Promise<any[]> {
  const connection = getConnection(app);
  const usersCollection = connection.collection('users');

  // Hash passwords before insertion (matching UsersService.hashPassword logic)
  const usersWithHashedPasswords = await Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
  );

  const result = await usersCollection.insertMany(usersWithHashedPasswords);
  return Object.values(result.insertedIds).map((id, index) => ({
    _id: id,
    ...usersWithHashedPasswords[index],
  }));
}

/**
 * Seeds pokemon into the test database
 * @param app - NestJS application instance
 * @param pokemon - Array of pokemon fixture data
 * @returns Array of created pokemon documents
 */
export async function seedPokemon(
  app: INestApplication,
  pokemon: PokemonFixtureData[],
): Promise<any[]> {
  const connection = getConnection(app);
  const pokemonCollection = connection.collection('pokemon');

  const pokemonWithTimestamps = pokemon.map((p) => ({
    ...p,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const result = await pokemonCollection.insertMany(pokemonWithTimestamps);
  return Object.values(result.insertedIds).map((id, index) => ({
    _id: id,
    ...pokemonWithTimestamps[index],
  }));
}

/**
 * Seeds rankings into the test database
 * @param app - NestJS application instance
 * @param rankings - Array of ranking fixture data
 * @param userId - Optional user ID to associate rankings with
 * @returns Array of created ranking documents
 */
export async function seedRankings(
  app: INestApplication,
  rankings: RankingFixtureData[],
  userId?: string,
): Promise<any[]> {
  const connection = getConnection(app);
  const rankingsCollection = connection.collection('rankings');
  const usersCollection = connection.collection('users');

  const rankingsWithTimestamps = rankings.map((r, index) => {
    const userValue = r.user || userId;
    // Add small delay to ensure different timestamps for sorting tests
    const timestamp = new Date(Date.now() + index);
    return {
      ...r,
      user: userValue
        ? typeof userValue === 'string'
          ? new Types.ObjectId(userValue)
          : userValue
        : new Types.ObjectId(),
      pokemon: (r.pokemon || []).map((id) =>
        typeof id === 'string' ? new Types.ObjectId(id) : id,
      ),
      zones: r.zones || [],
      likedBy: [],
      likesCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });

  const result = await rankingsCollection.insertMany(rankingsWithTimestamps);
  const seededRankings = Object.values(result.insertedIds).map((id, index) => ({
    _id: id,
    ...rankingsWithTimestamps[index],
  }));

  // Add ranking IDs to user's rankings array
  if (userId) {
    await usersCollection.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $push: { rankings: { $each: seededRankings.map((r) => r._id) } } },
    );
  }

  return seededRankings;
}

/**
 * Seeds boxes into the test database
 * @param app - NestJS application instance
 * @param boxes - Array of box fixture data
 * @param userId - User ID to associate boxes with
 * @returns Array of created box documents
 */
export async function seedBoxes(
  app: INestApplication,
  boxes: BoxFixtureData[],
  userId: string,
): Promise<any[]> {
  const connection = getConnection(app);
  const boxesCollection = connection.collection('boxes');
  const usersCollection = connection.collection('users');

  // Get user's username for denormalization
  const user = await usersCollection.findOne({
    _id: new Types.ObjectId(userId),
  });
  const defaultOwnerUsername = user?.username;

  const boxesWithTimestamps = boxes.map((b, index) => {
    // Add small delay to ensure different timestamps for sorting tests
    const timestamp = new Date(Date.now() + index);
    return {
      ...b,
      user: new Types.ObjectId(userId),
      ownerUsername: b.ownerUsername || defaultOwnerUsername,
      pokemon: b.pokemon || [],
      favoriteCount: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  });

  const result = await boxesCollection.insertMany(boxesWithTimestamps);
  const seededBoxes = Object.values(result.insertedIds).map((id, index) => ({
    _id: id,
    ...boxesWithTimestamps[index],
  }));

  // Add box IDs to user's boxes array
  await usersCollection.updateOne(
    { _id: new Types.ObjectId(userId) },
    { $push: { boxes: { $each: seededBoxes.map((b) => b._id) } } },
  );

  return seededBoxes;
}

/**
 * Convenience function to seed multiple entity types at once
 * @param app - NestJS application instance
 * @param data - Object containing arrays of users and/or pokemon to seed
 * @returns Object containing arrays of created documents
 */
export async function seedDatabase(
  app: INestApplication,
  data: {
    users?: UserFixtureData[];
    pokemon?: PokemonFixtureData[];
  },
) {
  const results: {
    users?: any[];
    pokemon?: any[];
  } = {};

  if (data.users) {
    results.users = await seedUsers(app, data.users);
  }

  if (data.pokemon) {
    results.pokemon = await seedPokemon(app, data.pokemon);
  }

  return results;
}
