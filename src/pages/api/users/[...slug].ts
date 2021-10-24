import { NextApiResponse } from 'next'
import { IRequest } from '../../../configs/types/IRequest'
import { getUsersPaginated } from '../_app/controllers/UserController'
import withMiddlewares, {
  AUTHENTICATION
} from '../_app/middlewares/WithMiddlewares'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await getUsersPaginated(req, res)
}

export default withMiddlewares(handler, { name: AUTHENTICATION })
