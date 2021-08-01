import { NextApiResponse } from 'next'
import { IRequest } from '../_app/config/type/IRequest'
import { getAllUsernames } from '../_app/controller/UserController'
import withMiddlewares, { AUTHENTICATION } from '../_app/middleware/WithMiddlewares'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await getAllUsernames(req, res)
}

export default withMiddlewares(handler, { name: AUTHENTICATION })
