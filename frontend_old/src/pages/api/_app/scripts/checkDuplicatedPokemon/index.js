const oldPokemonData = require('./old_pokemons.json')

function main() {
  const existent = {}
  const inconsistences = []

  for (const pokemon of oldPokemonData) {
    if (existent[pokemon.id]) {
      inconsistences.push(`${pokemon.id} - ${pokemon.name}`)
    }
    existent[pokemon.id] = true
  }

  console.log(inconsistences)
}

main()
