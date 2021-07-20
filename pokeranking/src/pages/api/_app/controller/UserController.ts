import UserRepository from '../repository/UserRepository'
import { ERROR, SUCCESS, USER_ALREADY_REGISTERED, USER_NOT_FOUND } from '../config/APIConfig'
import { Error } from 'mongoose'
import { NextApiRequest, NextApiResponse } from 'next'

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
  const response = await userRepository.store(userInfo)
  if (!response) {
    return res.status(ERROR.code).json(ERROR)
  }
  const user = response.toObject()
  delete user.password
  return res.status(SUCCESS.code).json({ ...SUCCESS, user })
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
