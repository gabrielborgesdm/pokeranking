import { NextApiResponse } from 'next'
import { IRequest } from '../../../configs/types/IRequest'
import { getAllUsernames } from '../_app/controllers/UserController'
import withMiddlewares, { AUTHENTICATION } from '../_app/middlewares/WithMiddlewares'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await getAllUsernames(req, res)
}

export default withMiddlewares(handler, { name: AUTHENTICATION })
