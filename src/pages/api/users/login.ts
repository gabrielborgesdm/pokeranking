import { NextApiResponse } from 'next'
import { IRequest } from '../_app/config/type/IRequest'
import { login } from '../_app/controller/UserController'
import withMiddlewares from '../_app/middleware/WithMiddlewares'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await login(req, res)
}

export default withMiddlewares(handler)
