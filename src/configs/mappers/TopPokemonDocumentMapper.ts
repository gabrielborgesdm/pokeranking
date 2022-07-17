import { ICommentDocument } from '../types/IComment'
import { IUser } from '../types/IUser'
import BaseMapper from './BaseMapper'
import CommentDocumentMapper from './CommentDocumentMapper'

export default class TopPokemonDocumentMapper extends BaseMapper {
  constructor() {
    super()
    const commentMapper = new CommentDocumentMapper()
    this.maps = {
      toResponse: {
        pokemon: 'pokemon',
        comments: [
          {
            key: 'comments',
            transform: (comments: ICommentDocument[]) => {
              return comments.map((comment) =>
                commentMapper.mapObject(commentMapper.maps.toResponse, comment)
              )
            }
          }
        ],
        userVotes: 'userVotes',
        position: 'position'
      }
    }
  }
}
