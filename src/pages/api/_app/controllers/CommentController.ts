import { NextApiResponse } from 'next'
import {
  ERROR, NOT_FOUND, SUCCESS
} from '../../../../configs/APIConfig'
import { ICommentRequest } from '../../../../configs/types/IComment'
import { IRequest } from '../../../../configs/types/IRequest'
import { sendResponse } from '../helpers/ResponseHelpers'

import CommentMapper from '../../../../configs/mappers/CommentMapper'
import CommentRepository from '../repositories/CommentRepository'
import UserRepository from '../repositories/UserRepository'

const commentRepository = new CommentRepository()
const userRepository = new UserRepository()

export const getAllComments = async (req: IRequest, res: NextApiResponse) => {
  let response = await commentRepository.getAll()
  response = CommentMapper.toResponse(response)
  sendResponse(req, res, SUCCESS, { response })
}

export const getCommentsByPostId = async (req: IRequest, res: NextApiResponse) => {
  let { slug: post } = req.query
  post = post as string
  let response = await commentRepository.getMany({ post })
  response = CommentMapper.toResponse(response)
  sendResponse(req, res, SUCCESS, { comments: response })
}

export const storeComment = async (req: IRequest, res: NextApiResponse) => {
  const payload: ICommentRequest = req.body
  const response = await commentRepository.store(payload)
  if (!checkPostExists(payload.post) || !checkUserExists(payload.user)) {
    return sendResponse(req, res, NOT_FOUND)
  }
  if (!response) {
    return sendResponse(req, res, ERROR)
  }
  const comment = CommentMapper.toResponse(response)
  sendResponse(req, res, SUCCESS, { comment })
}

const checkPostExists = (_id: string) => {
  return true
}

const checkUserExists = async (_id: string): Promise<boolean> => {
  const user = await userRepository.getById(_id)
  return !!user
}

export const updateComment = async (req: IRequest, res: NextApiResponse) => {
  const { slug } = req.query
  const _id = slug as string
  const { comment: payload } = req.body
  const foundComment = await commentRepository.getById(_id)
  if (!foundComment) {
    return sendResponse(req, res, NOT_FOUND)
  }
  let comment = await commentRepository.update(_id, payload)
  if (!comment) {
    return sendResponse(req, res, ERROR)
  }
  comment = CommentMapper.toResponse(comment)
  sendResponse(req, res, SUCCESS, { comment })
}

export const deleteComment = async (req: IRequest, res: NextApiResponse) => {
  const { slug } = req.query
  const _id = slug as string
  const foundComment = await commentRepository.getById(_id)
  if (!foundComment) {
    return sendResponse(req, res, NOT_FOUND)
  }
  let comment = await commentRepository.delete(_id)
  if (!comment) {
    return sendResponse(req, res, ERROR)
  }
  comment = CommentMapper.toResponse(comment)
  sendResponse(req, res, SUCCESS, { comment })
}
