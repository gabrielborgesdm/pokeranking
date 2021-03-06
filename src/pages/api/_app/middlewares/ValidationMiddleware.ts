import Joi from 'joi'
import { NextApiResponse } from 'next'
import { FIELD_VALIDATION_ERROR } from '../../../../configs/APIConfig'
import { IRequest } from '../../../../configs/types/IRequest'
import { sendResponse } from '../helpers/ResponseHelpers'

export const QUERY_TYPE = 'query'
export const BODY_TYPE = 'body'

const getValidationError = (schema: Joi.ObjectSchema, fields: object) => {
  const validation = schema.validate(fields)
  return validation.error ? validation.error : null
}

const ValidationMiddleware = async (
  req: IRequest,
  res: NextApiResponse,
  parameters: Array<Joi.ObjectSchema>
): Promise<boolean> => {
  let error = null
  if (parameters[0]) {
    error = getValidationError(parameters[0], req.body)
  }
  if (!error && parameters[1]) {
    error = getValidationError(parameters[1], req.query)
  }
  if (error) {
    sendResponse(req, res, FIELD_VALIDATION_ERROR, { error })
    return false
  }
  return true
}

export default ValidationMiddleware
