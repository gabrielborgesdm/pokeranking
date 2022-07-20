import { NextApiResponse } from 'next'
import { IRequest } from '../../../configs/types/IRequest'
import { getAllComments } from '../_app/controllers/CommentController'
import withMiddlewares, {
  AUTHENTICATION
} from '../_app/middlewares/WithMiddlewares'

const handler = async (req: IRequest, res: NextApiResponse) => {
  return await getAllComments(req, res)
}

export default withMiddlewares(handler, { name: AUTHENTICATION, parameters: [true] })
