import { NextApiResponse } from 'next'
import { IRequest } from '../../../configs/types/IRequest'
import { storeUser } from '../_app/controllers/UserController'
import withMiddlewares, {
  VALIDATION
} from '../_app/middlewares/WithMiddlewares'
import { UserAddSchema } from '../_app/models/schemas/UserSchemas'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await storeUser(req, res)
}

export default withMiddlewares(handler, {
  name: VALIDATION,
  parameters: [UserAddSchema]
})
