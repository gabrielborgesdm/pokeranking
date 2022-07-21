import { NextApiResponse } from 'next'

import { IRequest } from '../../../../configs/types/IRequest'
import { deleteComment } from '../../_app/controllers/CommentController'
import withMiddlewares, { AUTHENTICATION, VALIDATION } from '../../_app/middlewares/WithMiddlewares'
import { CommentIdSchema } from '../../_app/models/schemas/CommentSchema'

const handler = async (req: IRequest, res: NextApiResponse) => {
  return await deleteComment(req, res)
}

export default withMiddlewares(
  handler,
  { name: AUTHENTICATION },
  { name: VALIDATION, parameters: [null, CommentIdSchema] }
)
