import { IUser } from '../types/IUser'
import BaseMapper from './BaseMapper'

export default class CommentDocumentMapper extends BaseMapper {
  constructor() {
    super()

    this.maps = {
      toResponse: {
        comment: 'comment',
        user: [
          {
            key: 'username',
            transform: (user: IUser) => user.username
          }
        ],
        post: [
          {
            key: 'postId',
            transform: (post: any) => post._id
          }
        ]
      }
    }
  }
}
