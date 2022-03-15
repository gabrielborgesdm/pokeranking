import { NextApiResponse } from 'next'
import { IRequest } from '../../configs/types/IRequest'
import { confirmPasswordRecovery } from './_app/controllers/AuthController'
import withMiddlewares, { VALIDATION } from './_app/middlewares/WithMiddlewares'
import { AuthConfirmPasswordRecoverySchema } from './_app/models/schemas/UserSchemas'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await confirmPasswordRecovery(req, res)
}

export default withMiddlewares(handler, {
  name: VALIDATION,
  parameters: [AuthConfirmPasswordRecoverySchema]
})
