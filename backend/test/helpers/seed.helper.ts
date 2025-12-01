import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UserFixtureData } from '../fixtures/user.fixture';
import { PokemonFixtureData } from '../fixtures/pokemon.fixture';
import { RankingFixtureData } from '../fixtures/ranking.fixture';

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

  const rankingsWithTimestamps = rankings.map((r) => ({
    ...r,
    user: r.user || userId || new Types.ObjectId(),
    pokemon: r.pokemon || [],
    zones: r.zones || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

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
