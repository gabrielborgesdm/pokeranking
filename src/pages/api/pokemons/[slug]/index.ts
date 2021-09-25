import { NextApiResponse } from 'next'
import { IRequest } from '../../../../configs/types/IRequest'
import { getPokemon } from '../../_app/controllers/PokemonController'
import withMiddlewares, { AUTHENTICATION, VALIDATION } from '../../_app/middlewares/WithMiddlewares'
import { PokemonIdSchema } from '../../_app/models/schemas/PokemonSchemas'

const handler = async (req: IRequest, res: NextApiResponse) => {
  return await getPokemon(req, res)
}

export default withMiddlewares(handler, { name: AUTHENTICATION },
  { name: VALIDATION, parameters: [null, PokemonIdSchema] }
)
