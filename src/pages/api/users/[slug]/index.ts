import { NextApiResponse } from 'next'
import { IRequest } from '../../../../configs/types/IRequest'
import { getUserByUsername } from '../../_app/controllers/UserController'
import withMiddlewares, {
  AUTHENTICATION,
  VALIDATION
} from '../../_app/middlewares/WithMiddlewares'
import { UserUsernameSchema } from '../../_app/models/schemas/UserSchemas'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await getUserByUsername(req, res)
}

export default withMiddlewares(
  handler,
  { name: AUTHENTICATION, parameters: [true] },
  { name: VALIDATION, parameters: [null, UserUsernameSchema] }
)
