import { NextApiResponse } from 'next'
import { IRequest } from './_app/config/type/IRequest'
import { getManyPokemons } from './_app/controller/PokemonController'
import withMiddlewares, { middlewares } from './_app/middleware/WithMiddlewares'

const handler = async (req: IRequest, res: NextApiResponse) => {
  return await getManyPokemons(req, res)
}

export default withMiddlewares(handler, middlewares.authentication)
