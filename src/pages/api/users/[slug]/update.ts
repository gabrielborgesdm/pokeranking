import { NextApiResponse } from 'next'
import { IRequest } from '../../../../config/types/IRequest'
import { updateUser } from '../../_app/controller/UserController'
import withMiddlewares, { AUTHENTICATION, VALIDATION } from '../../_app/middleware/WithMiddlewares'
import { UserUpdateSchema, UserUsernameSchema } from '../../_app/model/schemas/UserSchemas'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await updateUser(req, res)
}

export default withMiddlewares(handler,
  { name: AUTHENTICATION },
  { name: VALIDATION, parameters: [UserUpdateSchema, UserUsernameSchema] }
)
