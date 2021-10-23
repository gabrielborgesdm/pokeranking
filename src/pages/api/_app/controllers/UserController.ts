import { NextApiResponse } from 'next'
import { ERROR, FORBIDDEN, INVALID_CREDENTIALS, SUCCESS, USER_ALREADY_REGISTERED, USER_NOT_FOUND } from '../../../../configs/APIConfig'
import { IRequest } from '../../../../configs/types/IRequest'
import { IResponse } from '../../../../configs/types/IResponse'
import { IUser, IUserAdd, IUserDocument } from '../../../../configs/types/IUser'
import { generateAccessToken, hashPassword, isPasswordValid } from '../helpers/AuthenticationHelpers'
import { sendResponse } from '../helpers/ResponseHelpers'
import { abstractUserBasedOnAuthorizationLevel, formatUserDocument, isUserAuthorized } from '../helpers/UserAuthorizationHelpers'
import PokemonRepository from '../repositories/PokemonRepository'
import UserRepository from '../repositories/UserRepository'
import { getAllPokemons } from './PokemonController';

const userRepository = new UserRepository()
const pokemonRepository = new PokemonRepository()


export const getAllUsers = async (req: IRequest, res: NextApiResponse) => {
  const response = await userRepository.getAll()
  let users: Array<IUser> = []
  if (response) {
    const allPokemons = await pokemonRepository.getThenLoadAllPokemons()
    users = response.map(userResponse => abstractUserBasedOnAuthorizationLevel(req, req.user, userResponse, allPokemons, false))
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
  const allPokemons = await pokemonRepository.getThenLoadAllPokemons()
  const user: IUser = abstractUserBasedOnAuthorizationLevel(req, req.user, response, allPokemons, false)
  sendResponse(req, res, SUCCESS, { user })
}

const isOkayToExecuteMutation = (authenticatedUser: IUser, response: IUserDocument): IResponse => {
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
  const allPokemons = await pokemonRepository.getThenLoadAllPokemons()
  const user = abstractUserBasedOnAuthorizationLevel(req, req.user, updateResponse, allPokemons)
  sendResponse(req, res, SUCCESS, { user })
}

export const deleteUser = async (req: IRequest, res: NextApiResponse) => {
  const { slug: username } = req.query
  const response = await userRepository.get({ username })
  const message = isOkayToExecuteMutation(req.user, response)
  if (!message.success) return sendResponse(req, res, message)
  const deleteResponse = await userRepository.delete(response._id)
  if (!deleteResponse) return sendResponse(req, res, ERROR)
  const allPokemons = await pokemonRepository.getThenLoadAllPokemons()
  const user = abstractUserBasedOnAuthorizationLevel(req, req.user, deleteResponse, allPokemons)
  return sendResponse(req, res, SUCCESS, { user: user })
}

export const storeUser = async (req: IRequest, res: NextApiResponse) => {
  const userInfo: IUserAdd = req.body.user
  const { username, email } = userInfo
  if (await getUser({ $or: [{ username }, { email }] })) return sendResponse(req, res, USER_ALREADY_REGISTERED)
  userInfo.password = await hashPassword(userInfo.password)
  if (!userInfo.avatar) userInfo.avatar = Math.floor(Math.random() * 929) + 1
  const response = await userRepository.store(userInfo)
  if (!response) return sendResponse(req, res, ERROR)
  const allPokemons = await pokemonRepository.getThenLoadAllPokemons()
  const user: IUser = formatUserDocument(req, response, allPokemons)
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
  const allPokemons = await pokemonRepository.getThenLoadAllPokemons()
  sendResponse(req, res, SUCCESS, { token, user: formatUserDocument(req, response, allPokemons) })
}
