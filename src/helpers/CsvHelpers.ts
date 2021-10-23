import { IUserPokemon } from '../configs/types/IUserPokemon'

export const convertPokemonsToCSV = (
  pokemons: Array<IUserPokemon>,
  lang: string
) => {
  const separator = lang.includes('pt') ? ';' : ','
  const headers = ['id', 'position', 'name', 'note']
  let csvData = ''
  headers.forEach(header => {
    csvData += `${header}${separator}`
  })
  pokemons.forEach((pokemon, index) => {
    csvData += `\n${pokemon.id};${index + 1};${pokemon.name};${
      pokemon.note || ''
    }`
  })
  return csvData
}
