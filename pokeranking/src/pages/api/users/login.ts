import { NextApiRequest, NextApiResponse } from 'next'
import { login } from '../_app/controller/UserController'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await login(req, res)
}

export default handler
