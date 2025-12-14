/**
 * Pokemon Seeder Script
 *
 * This script seeds or updates the Pokemon collection from the fixture file.
 * It reads from `fixtures/pokemon-fixture.json` and syncs the database.
 *
 * Behavior:
 *   - New Pokemon: Created with all data from fixture
 *   - Existing Pokemon (matched by name): Fields are synced with fixture
 *     - If fixture has data: fills in missing DB fields
 *     - If fixture lacks data (only name/image/pokedexNumber): removes extra
 *       attributes from DB to clear incorrect data
 *
 * This script is idempotent and safe to run multiple times.
 *
 * Usage: npm run seed:pokemon
 */

import { NestFactory } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';

interface PokemonFixture {
  name: string;
  image: string;
  pokedexNumber?: number;
  nameCode?: string;
  types?: string[];
  species?: string;
  height?: number;
  weight?: number;
  abilities?: string[];
  hp?: number;
  attack?: number;
  defense?: number;
  specialAttack?: number;
  specialDefense?: number;
  speed?: number;
  generation?: number;
}

async function seedPokemon() {
  console.log('='.repeat(50));
  console.log('Pokemon Seeder');
  console.log('='.repeat(50));
  console.log();

  // Define file path
  const fixturePath = path.join(__dirname, 'fixtures/pokemon-fixture.json');

  // Validate fixture file exists
  console.log('Checking fixture file...');

  if (!fs.existsSync(fixturePath)) {
    console.error(`Error: Fixture file not found: ${fixturePath}`);
    process.exit(1);
  }

  console.log(`  ✓ ${fixturePath}`);
  console.log();

  // Create NestJS app to get MongoDB connection
  console.log('Connecting to database...');
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
    console.log('  ✓ Connected to MongoDB\n');
  } catch {
    console.error('\n  ✗ Error: Could not connect to MongoDB.');
    console.error('    Make sure MongoDB is running.\n');
    await app.close();
    process.exit(1);
  }

  // Get Pokemon collection
  const pokemonCollection = connection.collection('pokemon');

  // Load fixture data
  console.log('=== Loading Fixture Data ===');
  const fixtureData: PokemonFixture[] = JSON.parse(
    fs.readFileSync(fixturePath, 'utf-8'),
  );
  console.log(`  Found ${fixtureData.length} Pokemon in fixture file\n`);

  // Seed Pokemon
  console.log('=== Seeding Pokemon ===');

  let created = 0;
  let updated = 0;
  let cleaned = 0;
  let unchanged = 0;
  const total = fixtureData.length;

  // Fields that can be removed if fixture doesn't have them
  const removableFields = [
    'nameCode',
    'types',
    'species',
    'height',
    'weight',
    'abilities',
    'hp',
    'attack',
    'defense',
    'specialAttack',
    'specialDefense',
    'speed',
    'generation',
  ];

  for (const pokemon of fixtureData) {
    // Build the document for insertion (only on new documents)
    const insertDoc: Record<string, unknown> = {
      name: pokemon.name,
      image: pokemon.image,
      createdAt: new Date(),
    };

    // Build the update document for filling missing fields
    // These fields will only be set if they don't already exist
    const setOnInsertFields: Record<string, unknown> = {};
    const setIfMissingFields: Record<string, unknown> = {};

    // Map fixture fields to database fields
    const optionalFields: Array<{ key: keyof PokemonFixture; dbKey?: string }> =
      [
        { key: 'pokedexNumber' },
        { key: 'types' },
        { key: 'species' },
        { key: 'height' },
        { key: 'weight' },
        { key: 'abilities' },
        { key: 'hp' },
        { key: 'attack' },
        { key: 'defense' },
        { key: 'specialAttack' },
        { key: 'specialDefense' },
        { key: 'speed' },
        { key: 'generation' },
      ];

    for (const { key, dbKey } of optionalFields) {
      const value = pokemon[key];
      if (value !== undefined) {
        const fieldName = dbKey || key;
        setOnInsertFields[fieldName] = value;
        setIfMissingFields[fieldName] = value;
      }
    }

    // Check if Pokemon exists
    const existing = await pokemonCollection.findOne({ name: pokemon.name });

    if (!existing) {
      // Create new Pokemon with all fields
      await pokemonCollection.insertOne({
        ...insertDoc,
        ...setOnInsertFields,
        updatedAt: new Date(),
      });
      created++;
    } else {
      // Update existing Pokemon
      const updateFields: Record<string, unknown> = {};
      const unsetFields: Record<string, unknown> = {};

      // Check if fixture is incomplete (only has name, image, pokedexNumber)
      const fixtureHasData = Object.keys(pokemon).some(
        (k) => !['name', 'image', 'pokedexNumber'].includes(k),
      );

      if (fixtureHasData) {
        // Fixture has data - fill in missing DB fields
        for (const [field, value] of Object.entries(setIfMissingFields)) {
          if (
            existing[field] === undefined ||
            existing[field] === null ||
            (Array.isArray(existing[field]) && existing[field].length === 0)
          ) {
            updateFields[field] = value;
          }
        }
      } else {
        // Fixture is incomplete - remove extra attributes from DB
        for (const field of removableFields) {
          if (existing[field] !== undefined && existing[field] !== null) {
            unsetFields[field] = '';
          }
        }
      }

      const hasUpdates = Object.keys(updateFields).length > 0;
      const hasUnsets = Object.keys(unsetFields).length > 0;

      if (hasUpdates || hasUnsets) {
        const updateOp: Record<string, unknown> = {};
        if (hasUpdates) {
          updateOp.$set = { ...updateFields, updatedAt: new Date() };
        }
        if (hasUnsets) {
          updateOp.$unset = unsetFields;
          if (!hasUpdates) {
            updateOp.$set = { updatedAt: new Date() };
          }
        }

        await pokemonCollection.updateOne({ _id: existing._id }, updateOp);

        if (hasUnsets) {
          cleaned++;
        } else {
          updated++;
        }
      } else {
        unchanged++;
      }
    }

    // Log progress every 100 Pokemon
    const processed = created + updated + cleaned + unchanged;
    if (processed % 100 === 0 || processed === total) {
      process.stdout.write(`\r  Processing: ${processed}/${total} Pokemon`);
    }
  }

  console.log('\n');

  // Summary
  console.log('='.repeat(50));
  console.log('Seed Complete');
  console.log('='.repeat(50));
  console.log(`  Created:   ${created}`);
  console.log(`  Updated:   ${updated}`);
  console.log(`  Cleaned:   ${cleaned}`);
  console.log(`  Unchanged: ${unchanged}`);
  console.log(`  Total:     ${total}`);
  console.log();

  await app.close();
}

seedPokemon()
  .then(() => {
    console.log('Pokemon seeder finished successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Pokemon seeder failed:', error);
    process.exit(1);
  });
