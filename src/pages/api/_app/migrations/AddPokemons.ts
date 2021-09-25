import PokemonRepository from '../repositories/PokemonRepository'
import pokemons from '../../../../assets/pokemons.json'

export const addPokemons = async () => {
  const pokemonRepository = new PokemonRepository()

  for (const pokemon of pokemons) {
    console.log('Adding: ' + pokemon.name)
    await pokemonRepository.store({
      name: pokemon.name,
      image: pokemon.image
    })
  }
}
