
import { NextApiResponse } from 'next'
import { IRequest } from '../../../../configs/types/IRequest'
import { deleteUser } from '../../_app/controllers/UserController'
import withMiddlewares, { AUTHENTICATION, VALIDATION } from '../../_app/middlewares/WithMiddlewares'
import { UserUsernameSchema } from '../../_app/models/schemas/UserSchemas'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await deleteUser(req, res)
}

export default withMiddlewares(handler,
  { name: AUTHENTICATION },
  { name: VALIDATION, parameters: [null, UserUsernameSchema] }
)
