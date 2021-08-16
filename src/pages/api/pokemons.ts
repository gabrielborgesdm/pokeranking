import { NextApiResponse } from 'next'
import { IRequest } from '../../configs/types/IRequest'
import { getManyPokemons } from './_app/controllers/PokemonController'
import withMiddlewares, { AUTHENTICATION } from './_app/middlewares/WithMiddlewares'

const handler = async (req: IRequest, res: NextApiResponse) => {
  return await getManyPokemons(req, res)
}

export default withMiddlewares(handler, { name: AUTHENTICATION })
