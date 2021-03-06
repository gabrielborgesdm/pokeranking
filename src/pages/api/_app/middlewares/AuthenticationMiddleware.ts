import Joi from 'joi'
import { NextApiResponse } from 'next'
import { FORBIDDEN, UNAUTHORIZED } from '../../../../configs/APIConfig'
import { IRequest } from '../../../../configs/types/IRequest'
import { verifyTokenAndGetUserId } from '../helpers/AuthenticationHelpers'
import { sendResponse } from '../helpers/ResponseHelpers'
import UserRepository from '../repositories/UserRepository'

const userRepository = new UserRepository()

const AuthenticationMiddleware = async (
  req: IRequest,
  res: NextApiResponse,
  parameters: Array<Joi.ObjectSchema>
): Promise<boolean> => {
  let isOkay = true
  const isPublic: any = parameters ? parameters[0] : false
  const token = getTokenFromRequest(req)
  if (!token && !isPublic) {
    sendResponse(req, res, UNAUTHORIZED)
    isOkay = false
  } else if (token) {
    const _id = verifyTokenAndGetUserId(token)
    if (!_id || !(await validateAndAddUserToRequest(_id, req))) {
      sendResponse(req, res, FORBIDDEN)
      isOkay = false
    }
  }
  return isOkay
}

const getTokenFromRequest = (req: IRequest): string => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  return token
}

const validateAndAddUserToRequest = async (_id: string, req: IRequest) => {
  const response = await userRepository.getById(_id)
  if (!response) return false
  req.user = response.toObject()
  return true
}

export default AuthenticationMiddleware
