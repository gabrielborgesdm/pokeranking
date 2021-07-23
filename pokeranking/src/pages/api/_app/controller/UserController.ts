import UserRepository from '../repository/UserRepository'
import { ERROR, FORBIDDEN, INVALID_CREDENTIALS, SUCCESS, USER_ALREADY_REGISTERED, USER_NOT_FOUND } from '../config/APIConfig'
import { NextApiResponse } from 'next'
import { generateAccessToken, hashPassword, isPasswordValid } from '../helper/AuthenticationHelpers'
import { IRequest } from '../config/types/IRequest'
import { IUserInterface } from '../config/types/IUser'
import { abstractUserBasedOnAuthorizationLevel, isUserAuthorized } from '../helper/UserAuthorizationHelpers'
import { IMessage } from '../config/types/IMessage'

const userRepository = new UserRepository()

export const getAllUsernames = async (req: IRequest, res: NextApiResponse) => {
  const response = await userRepository.getAll()
  let users: Array<string> = []
  if (response) {
    users = response.map((user) => user.username)
  }
  return res.status(SUCCESS.code).json({ ...SUCCESS, users })
}

const getUser = async (query: object) => {
  return await userRepository.get(query)
}

export const getUserByUsername = async (req: IRequest, res: NextApiResponse) => {
  const { slug: username } = req.query
  const response: IUserInterface = await userRepository.get({ username })
  if (!response) {
    return res.status(USER_NOT_FOUND.code).json(USER_NOT_FOUND)
  }
  const user = abstractUserBasedOnAuthorizationLevel(req.user, response)
  return res.status(SUCCESS.code).json({ ...SUCCESS, user })
}

const isOkayToExecuteMutation = (authenticatedUser: IUserInterface, response: IUserInterface) : IMessage => {
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
  console.log(message)
  if (!message.success) return res.status(message.code).json(message)
  const updateResponse = await userRepository.update(response._id, userInfo)
  if (!updateResponse) {
    return res.status(ERROR.code).json(ERROR)
  }
  const user = abstractUserBasedOnAuthorizationLevel(req.user, updateResponse)
  return res.status(SUCCESS.code).json({ ...SUCCESS, user })
}

export const deleteUser = async (req: IRequest, res: NextApiResponse) => {
  const { slug: username } = req.query
  const response = await userRepository.get({ username })
  const message = isOkayToExecuteMutation(req.user, response)
  if (!message.success) return res.status(message.code).json(message)
  const deleteResponse = await userRepository.delete(response._id)
  if (!deleteResponse) return res.status(ERROR.code).json(ERROR)
  const user = abstractUserBasedOnAuthorizationLevel(req.user, deleteResponse)
  return res.status(SUCCESS.code).json({ ...SUCCESS, user })
}

export const storeUser = async (req: IRequest, res: NextApiResponse) => {
  const { user: userInfo } = req.body
  const { username, email } = userInfo
  if (await getUser({ $or: [{ username }, { email }] })) {
    return res.status(USER_ALREADY_REGISTERED.code).json(USER_ALREADY_REGISTERED)
  }
  userInfo.password = await hashPassword(userInfo.password)
  const response = await userRepository.store(userInfo)
  if (!response) {
    return res.status(ERROR.code).json(ERROR)
  }
  const user = abstractUserBasedOnAuthorizationLevel(req.user, response)
  return res.status(SUCCESS.code).json({ ...SUCCESS, user })
}

export const login = async (req: IRequest, res: NextApiResponse) => {
  const { email, password } = req.body
  const response = await getUser({ email })
  if (!response) return res.status(USER_NOT_FOUND.code).json(USER_NOT_FOUND)
  if (!await isPasswordValid(password, response.password)) {
    return res.status(INVALID_CREDENTIALS.code).json(INVALID_CREDENTIALS)
  }
  const token = generateAccessToken({ _id: response._id })
  return res.status(SUCCESS.code).json({ ...SUCCESS, token })
}
