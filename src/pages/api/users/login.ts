import { NextApiResponse } from 'next'
import { IRequest } from '../../../configs/types/IRequest'
import { login } from '../_app/controllers/UserController'
import withMiddlewares, { VALIDATION } from '../_app/middlewares/WithMiddlewares'
import { UserLoginSchema } from '../_app/models/schemas/UserSchemas'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await login(req, res)
}

export default withMiddlewares(handler, { name: VALIDATION, parameters: [UserLoginSchema] })
