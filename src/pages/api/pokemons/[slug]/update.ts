import { NextApiResponse } from 'next'
import { USER_ROLES } from '../../../../configs/APIConfig'
import { IRequest } from '../../../../configs/types/IRequest'
import { updatePokemon } from '../../_app/controllers/PokemonController'
import withMiddlewares, {
  AUTHENTICATION,
  AUTHORIZATION,
  VALIDATION
} from '../../_app/middlewares/WithMiddlewares'
import {
  PokemonIdSchema,
  UpdatePokemonSchema
} from '../../_app/models/schemas/PokemonSchemas'

const handler = async (req: IRequest, res: NextApiResponse) => {
  return await updatePokemon(req, res)
}

export default withMiddlewares(
  handler,
  { name: AUTHENTICATION },
  { name: AUTHORIZATION, parameters: [USER_ROLES.ADMIN] },
  { name: VALIDATION, parameters: [UpdatePokemonSchema, PokemonIdSchema] }
)
