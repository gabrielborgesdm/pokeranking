import { NextApiResponse } from 'next'
import { IRequest } from '../../../../configs/types/IRequest'
import { updateUser } from '../../_app/controllers/UserController'
import withMiddlewares, { AUTHENTICATION, VALIDATION } from '../../_app/middlewares/WithMiddlewares'
import { UserUpdateSchema, UserUsernameSchema } from '../../_app/models/schemas/UserSchemas'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await updateUser(req, res)
}

export default withMiddlewares(handler,
  { name: AUTHENTICATION },
  { name: VALIDATION, parameters: [UserUpdateSchema, UserUsernameSchema] }
)
