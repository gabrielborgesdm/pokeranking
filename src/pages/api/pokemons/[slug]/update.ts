import { NextApiResponse } from 'next'
import { IRequest } from '../../../../configs/types/IRequest'
import { updatePokemon } from '../../_app/controllers/PokemonController'
import withMiddlewares, { AUTHENTICATION, VALIDATION } from '../../_app/middlewares/WithMiddlewares'
import { PokemonIdSchema, PokemonSchema } from '../../_app/models/schemas/PokemonSchemas'

const handler = async (req: IRequest, res: NextApiResponse) => {
  return await updatePokemon(req, res)
}

export default withMiddlewares(handler, { name: AUTHENTICATION },
  { name: VALIDATION, parameters: [PokemonSchema, PokemonIdSchema] }
)
