import { NextApiResponse } from 'next'
import { IRequest } from '../_app/config/type/IRequest'
import { storeUser } from '../_app/controller/UserController'
import withMiddlewares, { VALIDATION } from '../_app/middleware/WithMiddlewares'
import { UserAddSchema } from '../_app/model/schemas/UserSchemas'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await storeUser(req, res)
}

export default withMiddlewares(handler, { name: VALIDATION, parameters: [UserAddSchema] })
