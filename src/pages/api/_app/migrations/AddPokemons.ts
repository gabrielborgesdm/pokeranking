import PokemonRepository from '../repositories/PokemonRepository'
import pokemons from '../../../../assets/pokemons.json'
import { getImage, writeImage } from '../helpers/ImageHelpers'

export const addPokemons = async () => {
  const pokemonRepository = new PokemonRepository()

  const addedName = []
  for (const pokemon of pokemons) {
    console.log('Adding: ' + pokemon.name)
    const image = getImage(pokemon.image)
    const base64data = image.toString('base64')
    if (base64data) {
      const url = await writeImage(base64data)
      if (url) {
        if (!addedName.includes(pokemon.name)) {
          await pokemonRepository.store({
            name: pokemon.name,
            image: url
          })
          addedName.push(pokemon.name)
        }
      } else {
        break
      }
    }
  }
}
