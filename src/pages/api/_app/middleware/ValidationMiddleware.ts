import Joi from 'joi'
import { NextApiResponse } from 'next'
import { FIELD_VALIDATION_ERROR } from '../config/APIConfig'
import { IRequest } from '../config/type/IRequest'
import { sendResponse } from '../helper/ResponseHelpers'

const ValidationMiddleware = async (req: IRequest, res: NextApiResponse, parameters: Array<Joi.ObjectSchema>) : Promise<boolean> => {
  const validation = parameters[0].validate(req.body)
  if (validation.error) {
    sendResponse(res, FIELD_VALIDATION_ERROR, { error: validation.error })
    return false
  }
  return true
}

export default ValidationMiddleware
