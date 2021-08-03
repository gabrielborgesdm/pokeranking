import { NextApiResponse } from 'next'
import { IRequest } from '../../../config/types/IRequest'
import { login } from '../_app/controller/UserController'
import withMiddlewares, { VALIDATION } from '../_app/middleware/WithMiddlewares'
import { UserLoginSchema } from '../_app/model/schemas/UserSchemas'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await login(req, res)
}

export default withMiddlewares(handler, { name: VALIDATION, parameters: [UserLoginSchema] })
