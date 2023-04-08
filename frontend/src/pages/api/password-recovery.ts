import { NextApiResponse } from 'next'
import { IRequest } from '../../configs/types/IRequest'
import { recoverPassword } from './_app/controllers/AuthController'
import withMiddlewares, { VALIDATION } from './_app/middlewares/WithMiddlewares'
import { AuthPasswordRecoverySchema } from './_app/models/schemas/UserSchemas'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await recoverPassword(req, res)
}

export default withMiddlewares(handler, {
  name: VALIDATION,
  parameters: [AuthPasswordRecoverySchema]
})
