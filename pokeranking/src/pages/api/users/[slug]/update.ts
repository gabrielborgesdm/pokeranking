import { NextApiRequest, NextApiResponse } from 'next'
import { updateUser } from '../../_app/controller/UserController'
import withMiddlewares, { middlewares } from '../../_app/middleware/WithMiddlewares'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await updateUser(req, res)
}

export default withMiddlewares(handler, middlewares.authentication)
