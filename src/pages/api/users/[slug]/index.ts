import { NextApiResponse } from 'next'
import { IRequest } from '../../../../config/type/IRequest'
import { getUserByUsername } from '../../_app/controller/UserController'
import withMiddlewares, { AUTHENTICATION, VALIDATION } from '../../_app/middleware/WithMiddlewares'
import { UserUsernameSchema } from '../../_app/model/schemas/UserSchemas'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await getUserByUsername(req, res)
}

export default withMiddlewares(handler,
  { name: AUTHENTICATION },
  { name: VALIDATION, parameters: [null, UserUsernameSchema] }
)
