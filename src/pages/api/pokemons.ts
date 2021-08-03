import { NextApiResponse } from 'next'
import { IRequest } from '../../config/types/IRequest'
import { getManyPokemons } from './_app/controller/PokemonController'
import withMiddlewares, { AUTHENTICATION } from './_app/middleware/WithMiddlewares'

const handler = async (req: IRequest, res: NextApiResponse) => {
  return await getManyPokemons(req, res)
}

export default withMiddlewares(handler, { name: AUTHENTICATION })
