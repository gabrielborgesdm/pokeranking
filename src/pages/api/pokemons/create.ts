import { NextApiResponse } from 'next'

import { USER_ROLES } from '../../../configs/APIConfig'
import { IRequest } from '../../../configs/types/IRequest'
import withMiddlewares, { AUTHENTICATION, AUTHORIZATION, VALIDATION } from '../_app/middlewares/WithMiddlewares'
import { AddPokemonSchema } from '../_app/models/schemas/PokemonSchemas'

const handler = async (req: IRequest, res: NextApiResponse) => {
  // return await storePokemon(req, res)
  res.status(404)
}

export default withMiddlewares(handler, { name: AUTHENTICATION },
  { name: AUTHORIZATION, parameters: [USER_ROLES.ADMIN] },
  { name: VALIDATION, parameters: [AddPokemonSchema] }
)
