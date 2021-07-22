import { NextApiResponse } from 'next'
import { IRequest } from '../_app/config/types/IRequest'
import { login } from '../_app/controller/UserController'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await login(req, res)
}

export default handler
