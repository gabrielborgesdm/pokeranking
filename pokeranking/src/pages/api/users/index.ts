import { NextApiResponse } from 'next'
import { IRequest } from '../_app/config/types/IRequest'
import { getAllUsernames } from '../_app/controller/UserController'
import withMiddlewares, { middlewares } from '../_app/middleware/WithMiddlewares'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await getAllUsernames(req, res)
}

export default withMiddlewares(handler, middlewares.authentication)
