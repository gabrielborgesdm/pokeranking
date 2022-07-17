import { IModel } from './IModel'
import { IUser } from './IUser'

export interface ICommentDocument extends IModel {
  post: any
  user: IUser
  comment: string
}

export interface ICommentResponse extends IModel {
  postId: string
  username: string
  comment: string
}
