import { NextApiRequest, NextApiResponse } from 'next'
import { getAllUsernames } from '../_app/controller/UserController'
import withMiddlewares, { middlewares } from '../_app/middleware/WithMiddlewares'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await getAllUsernames(req, res)
}

export default withMiddlewares(handler, middlewares.authentication)
