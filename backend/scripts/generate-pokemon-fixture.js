const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'pokeranking.pokemons.json');
const outputPath = path.join(__dirname, 'pokemon-fixture.json');

const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

const simplified = data.map((p) => ({
  name: p.name,
  image: p.image,
  pokedexNumber: p.id,
}));

fs.writeFileSync(outputPath, JSON.stringify(simplified, null, 2));

console.log(`Generated ${simplified.length} Pokemon to ${outputPath}`);
