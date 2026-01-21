/**
 * Randomize Rankings Script
 *
 * This script updates existing rankings with:
 *   - Title: "{username}'s Ranking"
 *   - Theme: Random from available themes based on user's pokemon count
 *   - Background: Random from available themes based on user's pokemon count
 *
 * Usage: npx ts-node -r tsconfig-paths/register scripts/randomize-rankings.ts
 */

import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { AppModule } from '../src/app.module';
import {
  RANKING_THEMES,
  getAvailableThemes,
} from '@pokeranking/shared';

interface RankingDoc {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  pokemon: Types.ObjectId[];
  title: string;
  theme: string;
  background: string | null;
}

interface UserDoc {
  _id: Types.ObjectId;
  username: string;
  rankedPokemonCount: number;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T;
}

async function randomizeRankings() {
  console.log('='.repeat(50));
  console.log('Randomize Rankings Script');
  console.log('='.repeat(50));
  console.log();

  // Create NestJS app to get MongoDB connection
  console.log('Connecting to database...');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  const connection: Connection = app.get(getConnectionToken());

  const db = connection.db;
  if (!db) {
    console.error('\n  ✗ Error: Could not get database instance.');
    console.error('    Make sure MongoDB is running.\n');
    await app.close();
    process.exit(1);
  }

  // Verify connection
  try {
    await db.admin().ping();
    console.log('  ✓ Connected to MongoDB\n');
  } catch {
    console.error('\n  ✗ Error: Could not connect to MongoDB.');
    console.error('    Make sure MongoDB is running.\n');
    await app.close();
    process.exit(1);
  }

  // Get collections
  const rankingsCollection = connection.collection('rankings');
  const usersCollection = connection.collection('users');
  const pokemonCollection = connection.collection('pokemon');

  // Get total Pokemon count in the system
  const totalPokemonInSystem = await pokemonCollection.countDocuments();
  console.log(`Total Pokemon in system: ${totalPokemonInSystem}`);
  console.log();

  // Get all rankings
  const rankings = (await rankingsCollection
    .find({})
    .toArray()) as unknown as RankingDoc[];

  console.log(`Found ${rankings.length} rankings to update`);
  console.log();

  // Build user cache for usernames and pokemon counts
  const userIds = [...new Set(rankings.map((r) => r.user.toString()))];
  const users = (await usersCollection
    .find({ _id: { $in: userIds.map((id) => new Types.ObjectId(id)) } })
    .toArray()) as unknown as UserDoc[];

  const userMap = new Map<string, UserDoc>();
  for (const user of users) {
    userMap.set(user._id.toString(), user);
  }

  console.log(`Loaded ${userMap.size} users`);
  console.log();

  // Process each ranking
  let updated = 0;
  let skipped = 0;

  for (const ranking of rankings) {
    const user = userMap.get(ranking.user.toString());

    if (!user) {
      console.log(`  ⚠ Skipping ranking ${ranking._id}: user not found`);
      skipped++;
      continue;
    }

    // Get user's total ranked pokemon count
    const userPokemonCount = user.rankedPokemonCount;

    // Get available themes for this user
    const availableThemes = getAvailableThemes(
      userPokemonCount,
      totalPokemonInSystem,
    );

    if (availableThemes.length === 0) {
      console.log(
        `  ⚠ Skipping ranking ${ranking._id}: no themes available for user with ${userPokemonCount} pokemon`,
      );
      skipped++;
      continue;
    }

    // Generate new title
    const newTitle = `${user.username}'s Ranking`;

    // Pick random theme
    const randomTheme = getRandomElement(availableThemes);

    // Pick random background (from available themes)
    const randomBackground = getRandomElement(availableThemes);

    // Update the ranking
    await rankingsCollection.updateOne(
      { _id: ranking._id },
      {
        $set: {
          title: newTitle,
          theme: randomTheme.id,
          background: randomBackground.id,
          updatedAt: new Date(),
        },
      },
    );

    updated++;

    // Log progress every 100 rankings
    if (updated % 100 === 0 || updated === rankings.length - skipped) {
      process.stdout.write(
        `\r  Processing: ${updated}/${rankings.length - skipped} rankings`,
      );
    }
  }

  console.log();
  console.log();

  // Summary
  console.log('='.repeat(50));
  console.log('Summary');
  console.log('='.repeat(50));
  console.log(`  Updated:  ${updated}`);
  console.log(`  Skipped:  ${skipped}`);
  console.log();

  // Show theme distribution
  const themeStats = new Map<string, number>();
  const bgStats = new Map<string, number>();

  const updatedRankings = (await rankingsCollection
    .find({})
    .toArray()) as unknown as RankingDoc[];

  for (const r of updatedRankings) {
    themeStats.set(r.theme, (themeStats.get(r.theme) || 0) + 1);
    if (r.background) {
      bgStats.set(r.background, (bgStats.get(r.background) || 0) + 1);
    }
  }

  console.log('Theme Distribution:');
  for (const [theme, count] of [...themeStats.entries()].sort(
    (a, b) => b[1] - a[1],
  )) {
    const themeDef = RANKING_THEMES.find((t) => t.id === theme);
    console.log(`  ${themeDef?.displayName || theme}: ${count}`);
  }

  console.log();
  console.log('Background Distribution:');
  for (const [bg, count] of [...bgStats.entries()].sort(
    (a, b) => b[1] - a[1],
  )) {
    const themeDef = RANKING_THEMES.find((t) => t.id === bg);
    console.log(`  ${themeDef?.displayName || bg}: ${count}`);
  }

  console.log();

  await app.close();
}

randomizeRankings()
  .then(() => {
    console.log('Randomize script finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Randomize script failed:', error);
    process.exit(1);
  });
