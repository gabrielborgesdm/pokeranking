/**
 * Pokemon Image Migration Script
 *
 * This script downloads Pokemon images from ImageKit cloud storage
 * to local storage and updates the database to use local filenames.
 *
 * Behavior:
 *   - Scans all Pokemon for ImageKit URLs (containing 'ik.imagekit.io')
 *   - Downloads images to frontend/public/pokemon/
 *   - Updates database to store just the filename
 *   - Skips already downloaded images
 *
 * Usage: npm run migrate:images
 * Dry run: npm run migrate:images -- --dry-run
 */

import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { AppModule } from '../src/app.module';

const DRY_RUN = process.argv.includes('--dry-run');
const IMAGEKIT_PATTERN = /ik\.imagekit\.io/;
const TARGET_DIR = path.resolve(__dirname, '../../frontend/public/pokemon');

interface PokemonDoc {
  _id: Types.ObjectId;
  name: string;
  image: string;
}

interface MigrationStats {
  downloaded: number;
  skipped: number;
  alreadyLocal: number;
  failed: number;
  failedItems: Array<{ name: string; error: string }>;
}

function isImageKitUrl(image: string): boolean {
  return IMAGEKIT_PATTERN.test(image);
}

function extractFilename(imageUrl: string): string {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const filename = pathParts[pathParts.length - 1] || '';
    return decodeURIComponent(filename);
  } catch {
    // If URL parsing fails, try to extract filename directly
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1] || '';
    return decodeURIComponent(filename);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadImage(url: string, targetPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(targetPath);

    https
      .get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Handle redirects
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            file.close();
            fs.unlinkSync(targetPath);
            downloadImage(redirectUrl, targetPath).then(resolve).catch(reject);
            return;
          }
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlink(targetPath, () => {});
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
        file.on('error', (err) => {
          file.close();
          fs.unlink(targetPath, () => {});
          reject(err);
        });
      })
      .on('error', (err) => {
        file.close();
        fs.unlink(targetPath, () => {});
        reject(err);
      });
  });
}

async function downloadWithRetry(
  url: string,
  targetPath: string,
  retries = 3,
): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await downloadImage(url, targetPath);
      return true;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      await sleep(1000 * attempt); // Exponential backoff
    }
  }
  return false;
}

async function migrateImages() {
  console.log('='.repeat(50));
  console.log('Pokemon Image Migration Script');
  if (DRY_RUN) {
    console.log('*** DRY RUN MODE - No changes will be made ***');
  }
  console.log('='.repeat(50));
  console.log();

  // Create NestJS app to get MongoDB connection
  console.log('Checking prerequisites...');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });

  const connection: Connection = app.get(getConnectionToken());

  // Verify database connection
  const db = connection.db;
  if (!db) {
    console.error('\n  ✗ Error: Could not get database instance.');
    console.error('    Make sure MongoDB is running.\n');
    await app.close();
    process.exit(1);
  }

  try {
    await db.admin().ping();
    console.log('  ✓ Connected to MongoDB');
  } catch {
    console.error('\n  ✗ Error: Could not connect to MongoDB.');
    console.error('    Make sure MongoDB is running.\n');
    await app.close();
    process.exit(1);
  }

  // Verify target directory exists
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
    console.log(`  ✓ Created target directory: ${TARGET_DIR}`);
  } else {
    console.log(`  ✓ Target directory exists: ${TARGET_DIR}`);
  }
  console.log();

  // Get Pokemon collection
  const pokemonCollection = connection.collection('pokemon');

  // Query all Pokemon
  console.log('=== Scanning Pokemon ===');
  const allPokemon = (await pokemonCollection
    .find({})
    .toArray()) as unknown as PokemonDoc[];
  console.log(`  Found ${allPokemon.length} Pokemon in database`);

  // Filter to those with ImageKit URLs
  const pokemonToMigrate = allPokemon.filter((p) => isImageKitUrl(p.image));
  console.log(`  Found ${pokemonToMigrate.length} with ImageKit URLs`);

  // Count those already using local filenames
  const alreadyLocal = allPokemon.filter(
    (p) => p.image && !p.image.startsWith('http'),
  );
  console.log(`  ${alreadyLocal.length} already using local filenames`);
  console.log();

  if (pokemonToMigrate.length === 0) {
    console.log('No Pokemon need migration!');
    await app.close();
    process.exit(0);
  }

  // Migration phase
  console.log('=== Migrating Images ===');

  const stats: MigrationStats = {
    downloaded: 0,
    skipped: 0,
    alreadyLocal: 0,
    failed: 0,
    failedItems: [],
  };

  const total = pokemonToMigrate.length;

  for (let i = 0; i < pokemonToMigrate.length; i++) {
    const pokemon = pokemonToMigrate[i]!;
    const imageUrl = pokemon.image;
    const filename = extractFilename(imageUrl);
    const targetPath = path.join(TARGET_DIR, filename);

    // Check if file already exists locally
    const fileExists = fs.existsSync(targetPath);

    if (fileExists) {
      // File exists, just update database
      if (!DRY_RUN) {
        await pokemonCollection.updateOne(
          { _id: pokemon._id },
          { $set: { image: filename, updatedAt: new Date() } },
        );
      }
      stats.skipped++;
    } else {
      // Need to download
      try {
        if (!DRY_RUN) {
          await downloadWithRetry(imageUrl, targetPath);
          await pokemonCollection.updateOne(
            { _id: pokemon._id },
            { $set: { image: filename, updatedAt: new Date() } },
          );
        }
        stats.downloaded++;
      } catch (error) {
        stats.failed++;
        stats.failedItems.push({
          name: pokemon.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Log progress every 10 Pokemon
    const processed = i + 1;
    if (processed % 10 === 0 || processed === total) {
      process.stdout.write(`\r  Processing: ${processed}/${total} Pokemon`);
    }
  }

  console.log('\n');

  // Summary
  console.log('='.repeat(50));
  console.log('Migration Complete');
  console.log('='.repeat(50));
  console.log(`  Downloaded:     ${stats.downloaded}`);
  console.log(`  Skipped (exists): ${stats.skipped}`);
  console.log(`  Failed:         ${stats.failed}`);
  console.log(`  Total processed: ${total}`);

  if (stats.failedItems.length > 0) {
    console.log('\nFailed downloads:');
    for (const item of stats.failedItems) {
      console.log(`  - ${item.name}: ${item.error}`);
    }
  }

  console.log();
  await app.close();
}

migrateImages()
  .then(() => {
    console.log('Migration script finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
