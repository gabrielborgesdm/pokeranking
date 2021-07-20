import UserRepository from '../repository/UserRepository'
import { ERROR, SUCCESS, USER_ALREADY_REGISTERED, USER_NOT_FOUND } from '../config/APIConfig'
import { Error } from 'mongoose'
import { AddUserInterface, UpdateUserInterface } from '../model/UserModel'
import { NextApiRequest, NextApiResponse } from 'next'

const userRepository = new UserRepository()

// export const getAllUsers = async (req: NextApiRequest, res: NextApiResponse) => {
//   return await userRepository.getAll()
// }

// export const getUserById = async (req: NextApiRequest, res: NextApiResponse) => {
//   return await userRepository.getById(_id)
// }

const getUser = async (query: object) => {
  return await userRepository.get(query)
}

// export const deleteUser = async (req: NextApiRequest, res: NextApiResponse) => {
//   if (await getUserById(_id)) {
//     return await userRepository.delete(_id)
//   } else {
//     throw new Error(USER_NOT_FOUND.status)
//   }
// }

export const storeUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user: userInfo } = req.body

  const { username, email } = userInfo
  if (await getUser({ email, username })) {
    return res.status(USER_ALREADY_REGISTERED.code).json(USER_ALREADY_REGISTERED)
  }
  const user = await userRepository.store(userInfo)
  if (!user) {
    return res.status(ERROR.code).json(ERROR)
  }
  delete user.password
  res.status(SUCCESS.code).json({ ...SUCCESS, user })
}

// export const updateUser = async (req: NextApiRequest, res: NextApiResponse) => {
//   if (await getUserById(user._id)) {
//     return await userRepository.update(user._id, user)
//   } else {
//     throw new Error(USER_NOT_FOUND.status)
//   }
// }
