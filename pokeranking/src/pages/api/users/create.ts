import { NextApiRequest, NextApiResponse } from 'next'
import { storeUser } from '../_app/controller/UserController'
import withMiddlewares, { middlewares } from '../_app/middleware/WithMiddlewares'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await storeUser(req, res)
}

export default withMiddlewares(handler, middlewares.authentication)
