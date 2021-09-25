import fs from 'fs'
import path from 'path'
import { NextApiResponse } from 'next'
import { ERROR, POKEMON_ALREADY_REGISTERED, POKEMON_NOT_FOUND, SUCCESS } from '../../../../configs/APIConfig'
import { IRequest } from '../../../../configs/types/IRequest'
import { abstractPokemon } from '../helpers/PokemonHelpers'
import { sendResponse } from '../helpers/ResponseHelpers'
import PokemonRepository from '../repositories/PokemonRepository'
import { removeImage, writeImage } from '../helpers/ImageHelpers'

const pokemonRepository = new PokemonRepository()

export const getAllPokemons = async (req: IRequest, res: NextApiResponse) => {
  const pokemons = await pokemonRepository.getAll()
  const formattedPokemons = pokemons.map(pokemon => abstractPokemon(pokemon))
  return sendResponse(req, res, SUCCESS, { pokemons: formattedPokemons })
}

export const getPokemon = async (req: IRequest, res: NextApiResponse) => {
  const { slug }: any = req.query
  const pokemonId = parseInt(slug)
  const pokemon = await pokemonRepository.getById(pokemonId)
  if (!pokemon) return sendResponse(req, res, POKEMON_NOT_FOUND)
  return sendResponse(req, res, SUCCESS, { pokemon: abstractPokemon(pokemon) })
}

export const storePokemon = async (req: IRequest, res: NextApiResponse) => {
  const { pokemon: pokemonInfo } = req.body
  if (await pokemonRepository.get({ name: pokemonInfo.name })) return sendResponse(req, res, POKEMON_ALREADY_REGISTERED)
  const imageName = `${pokemonInfo.name}-${new Date().getTime()}.png`
  if (!writeImage(imageName, pokemonInfo.image)) return sendResponse(req, res, ERROR)
  pokemonInfo.image = imageName
  const pokemon = await pokemonRepository.store(pokemonInfo)
  if (!pokemon) {
    removeImage(imageName)
    return sendResponse(req, res, ERROR)
  }
  return sendResponse(req, res, SUCCESS, { pokemon: abstractPokemon(pokemon) })
}

export const updatePokemon = async (req: IRequest, res: NextApiResponse) => {
  const { slug }: any = req.query
  const { pokemon: pokemonInfo } = req.body
  const pokemonId = parseInt(slug)
  const pokemon = await pokemonRepository.update(pokemonId, pokemonInfo)
  if (!pokemon) {
    return sendResponse(req, res, ERROR)
  }
  return sendResponse(req, res, SUCCESS, { pokemon: abstractPokemon(pokemon) })
}
