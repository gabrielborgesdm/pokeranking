import { IModel } from './IModel'
import { IUser } from './IUser'

export interface ICommentDocument extends IModel {
  post: any
  user: IUser
  comment: string
}

export interface ICommentResponse extends IModel {
  post: string
  username: string
  comment: string
}

export interface ICommentRequest extends IModel {
  post: string
  user: string
  comment: string
}

export interface ICommentQuery extends IModel {
  _id?: string
  post?: string
  user?: string
  comment?: string
}
