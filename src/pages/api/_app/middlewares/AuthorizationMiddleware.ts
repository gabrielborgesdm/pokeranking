import Joi from 'joi'
import { NextApiResponse } from 'next'
import { FORBIDDEN } from '../../../../configs/APIConfig'
import { IRequest } from '../../../../configs/types/IRequest'
import { sendResponse } from '../helpers/ResponseHelpers'

const ValidationMiddleware = async (
  req: IRequest,
  res: NextApiResponse,
  parameters: Array<Joi.ObjectSchema>
): Promise<boolean> => {
  const allowedRoles: any = parameters[0]
  if (!allowedRoles.includes(req.user.role)) {
    sendResponse(req, res, FORBIDDEN)
    return false
  }
  return true
}

export default ValidationMiddleware
