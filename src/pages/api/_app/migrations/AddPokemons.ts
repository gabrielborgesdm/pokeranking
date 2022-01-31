import PokemonRepository from '../repositories/PokemonRepository'
import pokemons from '../../../../assets/pokemons.json'
import { getImage, getRelativePath } from '../helpers/PokemonImageHelpers'

export const addPokemons = async () => {
  const pokemonRepository = new PokemonRepository()
  const mappedPokemons = await getMappedPokemons(pokemonRepository)
  const stats = { duplicated: 0, imageNotFound: 0, added: 0 }

  for (const { name, image } of pokemons) {
    if (!checkImageExists(name, image, stats) || checkPokemonIsDuplicated(name, mappedPokemons, stats)) {
      continue
    }
    await addPokemon(name, image, pokemonRepository, mappedPokemons, stats)
  }
  logResults(stats)
}

const getMappedPokemons = async (pokemonRepository: PokemonRepository) => {
  const pokemonsMapped = {}
  const pokemons = await pokemonRepository.getAll()
  if (pokemons) {
    pokemons.forEach(({ name }) => {
      pokemonsMapped[name] = true
    })
  }
  return pokemonsMapped
}

const checkImageExists = (name: string, pokemonImage: string, stats: any) => {
  const imageFile = getImage(pokemonImage)
  if (!imageFile) {
    console.log(`Image not found: ${name} -> ${pokemonImage}`)
    stats.imageNotFound++
    return false
  }
  return true
}

const checkPokemonIsDuplicated = (name: string, mappedPokemons: any, stats: any) => {
  if (mappedPokemons[name]) {
    stats.duplicated++
    return true
  }
  return false
}

const addPokemon = async (name: string, image: string, pokemonRepository: PokemonRepository, mappedPokemons: any, stats: any) => {
  console.log(getRelativePath(image))
  await pokemonRepository.store({ name, image: getRelativePath(image) })
  mappedPokemons[name] = true
  console.log(`Added: ${name} -> ${image}`)
  stats.added++
}

const logResults = (stats: any) => {
  console.log(`${stats.added} pokemons added`)
  console.log(`${stats.duplicated} pokemons already existed`)
  console.log(`${stats.imageNotFound} pokemons with imageNotFound error`)
}
