import { NextApiResponse } from 'next'
import { IRequest } from '../../_app/config/type/IRequest'
import { getUserByUsername } from '../../_app/controller/UserController'
import withMiddlewares, { middlewares } from '../../_app/middleware/WithMiddlewares'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await getUserByUsername(req, res)
}

export default withMiddlewares(handler, middlewares.authentication)
