import { NextApiResponse } from 'next'
import { IRequest } from '../_app/config/types/IRequest'
import { storeUser } from '../_app/controller/UserController'

const handler = async (req: IRequest, res: NextApiResponse) => {
  await storeUser(req, res)
}

export default handler
