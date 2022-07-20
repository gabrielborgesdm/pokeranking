import { IUser } from '../types/IUser'
import BaseMapper from './BaseMapper'

export default class CommentMapper extends BaseMapper {
  static toResponse = (input: any) => this.map({
    comment: 'comment',
    user: [
      {
        key: 'username',
        transform: (user: IUser) => user.username
      },
      {
        key: 'userId',
        transform: (user: IUser) => user._id
      }
    ],
    post: [
      {
        key: 'postId',
        transform: (post: any) => post._id
      }
    ]
  }, input)
}
