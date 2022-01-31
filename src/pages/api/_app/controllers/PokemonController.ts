import { NextApiResponse } from 'next'
import {
  POKEMON_NOT_FOUND,
  SUCCESS
} from '../../../../configs/APIConfig'
import { IRequest } from '../../../../configs/types/IRequest'
import { abstractPokemon } from '../helpers/PokemonHelpers'
import { sendResponse } from '../helpers/ResponseHelpers'
import PokemonRepository from '../repositories/PokemonRepository'

const pokemonRepository = new PokemonRepository()

export const getAllPokemons = async (req: IRequest, res: NextApiResponse) => {
  const pokemons = await pokemonRepository.getAll()
  const formattedPokemons = pokemons.map((pokemon) =>
    abstractPokemon(req, pokemon)
  )
  return sendResponse(req, res, SUCCESS, { pokemons: formattedPokemons })
}

export const getPokemon = async (req: IRequest, res: NextApiResponse) => {
  const { slug }: any = req.query
  const pokemonId = parseInt(slug)
  const pokemon = await pokemonRepository.getById(pokemonId)
  if (!pokemon) return sendResponse(req, res, POKEMON_NOT_FOUND)
  return sendResponse(req, res, SUCCESS, {
    pokemon: abstractPokemon(req, pokemon)
  })
}
