import { SUCCESS } from '../../../../config/APIConfig'
import { NextApiResponse } from 'next'
import { IRequest } from '../../../../config/types/IRequest'
import PokemonRepository from '../repository/PokemonRepository'
import { sendResponse } from '../helper/ResponseHelpers'

const pokemonRepository = new PokemonRepository()

export const getManyPokemons = async (req: IRequest, res: NextApiResponse) => {
  const { filter } = req.body
  const pokemons = pokemonRepository.getMany(filter)
  return sendResponse(req, res, SUCCESS, { pokemons })
}
