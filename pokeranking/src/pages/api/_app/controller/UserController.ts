import UserRepository from '../repository/UserRepository'
import { ERROR, INVALID_CREDENTIALS, SUCCESS, USER_ALREADY_REGISTERED, USER_NOT_FOUND } from '../config/APIConfig'
import { NextApiRequest, NextApiResponse } from 'next'
import { compareHash, generateAccessToken, hashPassword, isPasswordValid } from '../helper/AuthenticationHelper'
import { cpuUsage } from 'process'

const userRepository = new UserRepository()

export const getAllUsernames = async (req: NextApiRequest, res: NextApiResponse) => {
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

export const getUserByUsername = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug: username } = req.query
  const response = await userRepository.get({ username })
  if (!response) {
    return res.status(USER_NOT_FOUND.code).json(USER_NOT_FOUND)
  }
  const user = response.toObject()
  delete user.password
  return res.status(SUCCESS.code).json({ ...SUCCESS, user })
}

export const deleteUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug: username } = req.query
  const response = await userRepository.get({ username })
  if (!response) {
    return res.status(USER_NOT_FOUND.code).json(USER_NOT_FOUND)
  }
  const deleteResponse = await userRepository.delete(response._id)
  if (!deleteResponse) {
    return res.status(ERROR.code).json(ERROR)
  }
  const user = deleteResponse.toObject()
  delete user.password
  return res.status(SUCCESS.code).json({ ...SUCCESS, user })
}

export const storeUser = async (req: NextApiRequest, res: NextApiResponse) => {
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
  const user = response.toObject()
  delete user.password
  return res.status(SUCCESS.code).json({ ...SUCCESS, user })
}

export const login = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password } = req.body
  const response = await getUser({ email })
  if (!response) return res.status(USER_NOT_FOUND.code).json(USER_NOT_FOUND)
  if (!await isPasswordValid(password, response.password)) {
    return res.status(INVALID_CREDENTIALS.code).json(INVALID_CREDENTIALS)
  }
  const token = generateAccessToken({ _id: response._id })
  return res.status(SUCCESS.code).json({ ...SUCCESS, token })
}

export const updateUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const { slug: username } = req.query
  const { user: userInfo } = req.body
  const response = await userRepository.get({ username })
  if (!response) {
    return res.status(USER_NOT_FOUND.code).json(USER_NOT_FOUND)
  }
  const updateResponse = await userRepository.update(response._id, userInfo)
  if (!updateResponse) {
    return res.status(ERROR.code).json(ERROR)
  }
  const user = updateResponse.toObject()
  delete user.password
  return res.status(SUCCESS.code).json({ ...SUCCESS, user })
}
