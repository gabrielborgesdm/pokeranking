/**
 * Database Seed Script
 *
 * This script migrates data from the old MongoDB export files to the new schema.
 * It reads two JSON files from the `scripts/seed/` directory:
 *   - pokeranking.pokemons.json: Pokemon data with numeric IDs
 *   - pokeranking.users.json: User data with pokemon references
 *
 * The script performs the following operations:
 *   1. Seeds Pokemon collection (preserving original _id)
 *   2. Seeds Users collection (mapping fields to new schema)
 *   3. Creates a "My Ranking" for each user with their Pokemon
 *
 * Key transformations:
 *   - User role: "user" → "member"
 *   - User avatar → profilePic (as string)
 *   - User isActive: set to true
 *   - Ranking zones: Top 10 zone added only if user has > 10 pokemon
 *
 * This script is idempotent - it uses upserts so it can be run multiple times safely.
 *
 * Usage: npm run seed
 */

import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';

// Types for MongoDB Extended JSON format
interface MongoExtendedJsonId {
  $oid: string;
}

interface MongoExtendedJsonDate {
  $date: string;
}

interface PokemonJson {
  _id: MongoExtendedJsonId;
  id: number; // Numeric ID for mapping
  name: string;
  image: string;
  createdAt?: MongoExtendedJsonDate;
  updatedAt?: MongoExtendedJsonDate;
}

interface UserPokemonJson {
  pokemon: number; // References Pokemon.id (numeric)
  note?: string;
}

interface UserJson {
  _id: MongoExtendedJsonId;
  username: string;
  email: string;
  password: string;
  avatar?: number;
  role?: string;
  pokemons?: UserPokemonJson[];
  createdAt?: MongoExtendedJsonDate;
  updatedAt?: MongoExtendedJsonDate;
}

async function seedDatabase() {
  console.log('='.repeat(50));
  console.log('Database Seed Script');
  console.log('='.repeat(50));
  console.log();

  // Define file paths
  const seedDir = path.join(__dirname, 'seed');
  const pokemonJsonPath = path.join(seedDir, 'pokeranking.pokemons.json');
  const usersJsonPath = path.join(seedDir, 'pokeranking.users.json');

  // Validate seed files exist
  console.log('Checking seed files...');

  if (!fs.existsSync(seedDir)) {
    console.error(`Error: Seed directory not found: ${seedDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(pokemonJsonPath)) {
    console.error(`Error: Pokemon seed file not found: ${pokemonJsonPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(usersJsonPath)) {
    console.error(`Error: Users seed file not found: ${usersJsonPath}`);
    process.exit(1);
  }

  console.log(`  ✓ ${pokemonJsonPath}`);
  console.log(`  ✓ ${usersJsonPath}`);
  console.log();

  // Create NestJS app to get MongoDB connection
  console.log('Connecting to database...');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  const connection: Connection = app.get(getConnectionToken());

  // Verify database connection and replica set status
  const db = connection.db;
  if (!db) {
    console.error("\n  ✗ Error: Could not get database instance.");
    console.error("    Make sure MongoDB is running.\n");
    await app.close();
    process.exit(1);
  }

  interface ReplicaSetMember {
    name: string;
    stateStr: string;
  }

  interface ReplicaSetStatus {
    members?: ReplicaSetMember[];
  }

  const RS_INIT_CMD =
    "docker exec pokeranking-mongo mongosh --quiet --eval \"rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})\"";

  try {
    const adminDb = db.admin();
    const status: ReplicaSetStatus = await adminDb.command({
      replSetGetStatus: 1,
    });
    const primary = status.members?.find((m) => m.stateStr === "PRIMARY");

    if (!primary) {
      console.error("\n  ✗ Error: MongoDB replica set has no PRIMARY node.");
      console.error("    The replica set may not be initialized yet.");
      console.error("\n  To fix this, run:");
      console.error(`    ${RS_INIT_CMD}`);
      console.error("\n  Then wait a few seconds and try again.\n");
      await app.close();
      process.exit(1);
    }

    console.log("  ✓ Connected to MongoDB replica set");
    console.log(`  ✓ Primary node: ${primary.name}\n`);
  } catch (error: unknown) {
    const mongoError = error as { codeName?: string; message?: string };
    if (mongoError.codeName === "NotYetInitialized") {
      console.error("\n  ✗ Error: MongoDB replica set is not initialized.");
      console.error("\n  To fix this, run:");
      console.error(`    ${RS_INIT_CMD}`);
      console.error("\n  Then wait a few seconds and try again.\n");
      await app.close();
      process.exit(1);
    }
    // For non-replica set setups, just verify we can ping
    try {
      await db.admin().ping();
      console.log("  ✓ Connected to MongoDB\n");
    } catch {
      console.error("\n  ✗ Error: Could not connect to MongoDB.");
      console.error("    Make sure MongoDB is running.\n");
      await app.close();
      process.exit(1);
    }
  }

  // Get collections
  const pokemonCollection = connection.collection('pokemon');
  const usersCollection = connection.collection('users');
  const rankingsCollection = connection.collection('rankings');

  // ============================================
  // STEP 1: Seed Pokemon and build ID map
  // ============================================
  console.log('=== Step 1: Seeding Pokemon ===');

  const pokemonData: PokemonJson[] = JSON.parse(
    fs.readFileSync(pokemonJsonPath, 'utf-8'),
  );

  console.log(`  Found ${pokemonData.length} pokemon in seed file`);

  // Map: numeric id → ObjectId (for resolving user pokemon references)
  const pokemonIdMap = new Map<number, Types.ObjectId>();
  // Map: numeric id → image name (for resolving user avatar/profilePic)
  const pokemonImageMap = new Map<number, string>();

  let pokemonUpserted = 0;
  const pokemonTotal = pokemonData.length;

  for (const pokemon of pokemonData) {
    const objectId = new Types.ObjectId(pokemon._id.$oid);

    // Build mapping from numeric ID to ObjectId and image
    pokemonIdMap.set(pokemon.id, objectId);
    pokemonImageMap.set(pokemon.id, pokemon.image);

    // Upsert pokemon
    await pokemonCollection.updateOne(
      { _id: objectId },
      {
        $set: {
          name: pokemon.name,
          image: pokemon.image,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: pokemon.createdAt?.$date
            ? new Date(pokemon.createdAt.$date)
            : new Date(),
        },
      },
      { upsert: true },
    );
    pokemonUpserted++;

    // Log progress every 100 pokemon
    if (pokemonUpserted % 100 === 0 || pokemonUpserted === pokemonTotal) {
      process.stdout.write(
        `\r  Processing: ${pokemonUpserted}/${pokemonTotal} pokemon`,
      );
    }
  }

  console.log(`\n  ✓ Upserted: ${pokemonUpserted}`);
  console.log(`  ✓ ID map entries: ${pokemonIdMap.size}`);
  console.log(`  ✓ Image map entries: ${pokemonImageMap.size}`);
  console.log();

  // ============================================
  // STEP 2: Seed Users
  // ============================================
  console.log('=== Step 2: Seeding Users ===');

  const usersData: UserJson[] = JSON.parse(
    fs.readFileSync(usersJsonPath, 'utf-8'),
  );

  console.log(`  Found ${usersData.length} users in seed file`);

  // Store user data for ranking creation
  const userPokemonData: Array<{
    userId: Types.ObjectId;
    pokemonIds: Types.ObjectId[];
  }> = [];

  // Track seen emails to skip duplicates in seed data
  const seenEmails = new Set<string>();

  let usersUpserted = 0;
  let usersSkipped = 0;
  let usersWithPokemon = 0;
  let usersWithProfilePic = 0;
  let missingPokemonRefs = 0;
  let missingAvatarRefs = 0;
  const usersTotal = usersData.length;

  for (const user of usersData) {
    const email = user.email.toLowerCase();

    // Skip duplicate emails in seed data
    if (seenEmails.has(email)) {
      usersSkipped++;
      continue;
    }
    seenEmails.add(email);

    const userId = new Types.ObjectId(user._id.$oid);

    // Map user's pokemon numeric IDs to ObjectIds
    const pokemonObjectIds: Types.ObjectId[] = [];
    if (user.pokemons && user.pokemons.length > 0) {
      for (const p of user.pokemons) {
        const pokemonOid = pokemonIdMap.get(p.pokemon);
        if (pokemonOid) {
          pokemonObjectIds.push(pokemonOid);
        } else {
          missingPokemonRefs++;
        }
      }
    }

    // Map role: "user" → "member", "admin" stays as-is
    const role = user.role === "admin" ? "admin" : "member";

    // Map avatar (numeric Pokemon ID) to actual image name
    let profilePic: string | null = null;
    if (user.avatar !== undefined) {
      const avatarImage = pokemonImageMap.get(user.avatar);
      if (avatarImage) {
        profilePic = avatarImage;
        usersWithProfilePic++;
      } else {
        missingAvatarRefs++;
      }
    }

    // Upsert user by email (since email is unique index)
    const result = await usersCollection.findOneAndUpdate(
      { email: email },
      {
        $set: {
          username: user.username,
          password: user.password,
          profilePic: profilePic,
          role: role,
          isActive: true,
          rankedPokemonCount: pokemonObjectIds.length,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          _id: userId,
          email: email,
          rankings: [],
          boxes: [],
          createdAt: user.createdAt?.$date
            ? new Date(user.createdAt.$date)
            : new Date(),
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    usersUpserted++;

    // Store for ranking creation if user has pokemon
    // Use the actual user ID from database (in case it was already existing)
    if (pokemonObjectIds.length > 0 && result && result._id) {
      usersWithPokemon++;
      userPokemonData.push({
        userId: result._id as Types.ObjectId,
        pokemonIds: pokemonObjectIds,
      });
    }

    // Log progress every 100 users
    if (usersUpserted % 100 === 0 || usersUpserted === usersTotal) {
      process.stdout.write(
        `\r  Processing: ${usersUpserted}/${usersTotal} users`,
      );
    }
  }

  console.log(`\n  ✓ Upserted: ${usersUpserted}`);
  if (usersSkipped > 0) {
    console.log(`  ⚠ Skipped: ${usersSkipped} duplicate emails in seed data`);
  }
  console.log(`  ✓ Users with pokemon: ${usersWithPokemon}`);
  console.log(`  ✓ Users with profilePic: ${usersWithProfilePic}`);
  if (missingAvatarRefs > 0) {
    console.log(
      `  ⚠ Warning: ${missingAvatarRefs} avatar references could not be resolved`,
    );
  }
  if (missingPokemonRefs > 0) {
    console.log(
      `  ⚠ Warning: ${missingPokemonRefs} pokemon references could not be resolved`,
    );
  }
  console.log();

  // ============================================
  // STEP 3: Seed Rankings
  // ============================================
  console.log('=== Step 3: Seeding Rankings ===');

  let rankingsUpserted = 0;
  let rankingsWithZones = 0;
  const rankingsTotal = userPokemonData.length;

  for (const userData of userPokemonData) {
    const { userId, pokemonIds } = userData;

    // Only add Top 10 zone if user has more than 10 pokemon
    const zones =
      pokemonIds.length > 10
        ? [
            {
              name: "Top 10",
              interval: [1, 10],
              color: "#FFD700",
            },
          ]
        : [];

    if (zones.length > 0) {
      rankingsWithZones++;
    }

    // Upsert ranking by user (one ranking per user)
    const result = await rankingsCollection.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          title: "My Ranking",
          pokemon: pokemonIds,
          zones: zones,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          user: userId,
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    // Update user's rankings array to include this ranking
    if (result && result._id) {
      await usersCollection.updateOne(
        { _id: userId },
        { $addToSet: { rankings: result._id } },
      );
    }

    rankingsUpserted++;

    // Log progress every 100 rankings
    if (rankingsUpserted % 100 === 0 || rankingsUpserted === rankingsTotal) {
      process.stdout.write(
        `\r  Processing: ${rankingsUpserted}/${rankingsTotal} rankings`,
      );
    }
  }

  console.log(`\n  ✓ Upserted: ${rankingsUpserted}`);
  console.log(`  ✓ With Top 10 zone: ${rankingsWithZones}`);
  console.log();

  // ============================================
  // Summary
  // ============================================
  console.log('='.repeat(50));
  console.log('Seed Complete');
  console.log('='.repeat(50));
  console.log(`  Pokemon:  ${pokemonUpserted}`);
  console.log(`  Users:    ${usersUpserted}`);
  console.log(`  Rankings: ${rankingsUpserted}`);
  console.log();

  await app.close();
}

seedDatabase()
  .then(() => {
    console.log('Seed script finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });
