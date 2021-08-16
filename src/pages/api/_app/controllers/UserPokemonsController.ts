import { SUCCESS } from '../../../../configs/APIConfig'
import { NextApiResponse } from 'next'
import { IRequest } from '../../../../configs/types/IRequest'
import PokemonRepository from '../repositories/PokemonRepository'
import { sendResponse } from '../helpers/ResponseHelpers'

const pokemonRepository = new PokemonRepository()

export const getManyPokemons = async (req: IRequest, res: NextApiResponse) => {
  const { filter } = req.body
  const pokemons = pokemonRepository.getMany(filter)
  return sendResponse(req, res, SUCCESS, { pokemons })
}
