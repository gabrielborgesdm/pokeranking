import { NextApiResponse } from 'next'
import { ERROR, FORBIDDEN, INVALID_CREDENTIALS, NUMBER_POKEMONS, SUCCESS, USER_ALREADY_REGISTERED, USER_NOT_FOUND } from '../../../../configs/APIConfig'
import { IRequest } from '../../../../configs/types/IRequest'
import { IResponse } from '../../../../configs/types/IResponse'
import { IUser, IUserAdd, IUserDocument } from '../../../../configs/types/IUser'
import { generateAccessToken, hashPassword, isPasswordValid } from '../helpers/AuthenticationHelpers'
import { sendResponse } from '../helpers/ResponseHelpers'
import { abstractUserBasedOnAuthorizationLevel, formatUserDocument, isUserAuthorized } from '../helpers/UserAuthorizationHelpers'
import UserRepository from '../repositories/UserRepository'

const userRepository = new UserRepository()

export const getAllUsers = async (req: IRequest, res: NextApiResponse) => {
  const response = await userRepository.getAll()
  let users: Array<IUser> = []
  if (response) {
    users = response.map((user) => abstractUserBasedOnAuthorizationLevel(req.user, user))
  }
  sendResponse(req, res, SUCCESS, { users })
}

const getUser = async (query: object) => {
  return await userRepository.get(query)
}

export const getUserByUsername = async (req: IRequest, res: NextApiResponse) => {
  const { slug: username } = req.query
  const response: IUserDocument = await userRepository.get({ username })
  if (!response) return sendResponse(req, res, USER_NOT_FOUND)
  const user: IUser = abstractUserBasedOnAuthorizationLevel(req.user, response)
  sendResponse(req, res, SUCCESS, { user })
}

const isOkayToExecuteMutation = (authenticatedUser: IUser, response: IUserDocument) : IResponse => {
  if (!response) {
    return USER_NOT_FOUND
  }
  if (!isUserAuthorized(authenticatedUser, response)) {
    return FORBIDDEN
  }
  return SUCCESS
}

export const updateUser = async (req: IRequest, res: NextApiResponse) => {
  const { slug: username } = req.query
  const { user: userInfo } = req.body
  const response = await userRepository.get({ username })
  const message = isOkayToExecuteMutation(req.user, response)
  if (!message.success) return sendResponse(req, res, message, message)
  if (userInfo.password) userInfo.password = await hashPassword(userInfo.password)
  const updateResponse = await userRepository.update(response._id, userInfo)
  if (!updateResponse) {
    return sendResponse(req, res, ERROR)
  }
  const user = abstractUserBasedOnAuthorizationLevel(req.user, updateResponse)
  sendResponse(req, res, SUCCESS, { user })
}

export const deleteUser = async (req: IRequest, res: NextApiResponse) => {
  const { slug: username } = req.query
  const response = await userRepository.get({ username })
  const message = isOkayToExecuteMutation(req.user, response)
  if (!message.success) return sendResponse(req, res, message)
  const deleteResponse = await userRepository.delete(response._id)
  if (!deleteResponse) return sendResponse(req, res, ERROR)
  const user = abstractUserBasedOnAuthorizationLevel(req.user, deleteResponse)
  return sendResponse(req, res, SUCCESS, { user: user })
}

export const storeUser = async (req: IRequest, res: NextApiResponse) => {
  const userInfo: IUserAdd = req.body.user
  const { username, email } = userInfo
  if (await getUser({ $or: [{ username }, { email }] })) return sendResponse(req, res, USER_ALREADY_REGISTERED)
  userInfo.password = await hashPassword(userInfo.password)
  if (!userInfo.avatar) userInfo.avatar = Math.floor(Math.random() * NUMBER_POKEMONS) + 1
  const response = await userRepository.store(userInfo)
  if (!response) return sendResponse(req, res, ERROR)
  const user: IUser = formatUserDocument(response)
  sendResponse(req, res, SUCCESS, { user })
}

export const login = async (req: IRequest, res: NextApiResponse) => {
  const { email, password } = req.body
  const response = await getUser({ email })
  if (!response) return sendResponse(req, res, USER_NOT_FOUND)
  if (!await isPasswordValid(password, response.password)) {
    return sendResponse(req, res, INVALID_CREDENTIALS)
  }
  const token = generateAccessToken({ _id: response._id })
  sendResponse(req, res, SUCCESS, { token, user: formatUserDocument(response) })
}
