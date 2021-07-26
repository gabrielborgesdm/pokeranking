import { SUCCESS } from '../config/APIConfig'
import { NextApiResponse } from 'next'
import { IRequest } from '../config/type/IRequest'
import PokemonRepository from '../repository/PokemonRepository'

const pokemonRepository = new PokemonRepository()

export const getManyPokemons = async (req: IRequest, res: NextApiResponse) => {
  const { filter } = req.body
  const pokemons = pokemonRepository.getMany(filter)
  return res.status(SUCCESS.code).json({ ...SUCCESS, pokemons })
}
