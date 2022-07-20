import { NextApiResponse } from 'next'

import { IRequest } from '../../../configs/types/IRequest'
import { storeComment } from '../_app/controllers/CommentController'
import withMiddlewares, { AUTHENTICATION, VALIDATION } from '../_app/middlewares/WithMiddlewares'
import { AddCommentSchema } from '../_app/models/schemas/CommentSchema'

const handler = async (req: IRequest, res: NextApiResponse) => {
  return await storeComment(req, res)
}

export default withMiddlewares(
  handler,
  { name: AUTHENTICATION },
  { name: VALIDATION, parameters: [AddCommentSchema] }
)
