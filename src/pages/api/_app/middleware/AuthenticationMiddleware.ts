import { NextApiResponse } from 'next'
import { FORBIDDEN, UNAUTHORIZED } from '../../../../config/APIConfig'
import { IRequest } from '../../../../config/types/IRequest'
import { verifyTokenAndGetUserId } from '../helper/AuthenticationHelpers'
import { sendResponse } from '../helper/ResponseHelpers'
import UserRepository from '../repository/UserRepository'

const userRepository = new UserRepository()

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

const AuthenticationMiddleware = async (req: IRequest, res: NextApiResponse) : Promise<boolean> => {
  let isOkay = true
  const token = getTokenFromRequest(req)
  if (!token) {
    sendResponse(res, UNAUTHORIZED)
    isOkay = false
  } else {
    const _id = verifyTokenAndGetUserId(token)
    if (!_id || !await validateAndAddUserToRequest(_id, req)) {
      sendResponse(res, FORBIDDEN)
      isOkay = false
    }
  }
  return isOkay
}

export default AuthenticationMiddleware
