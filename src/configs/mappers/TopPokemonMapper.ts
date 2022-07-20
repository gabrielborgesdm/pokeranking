import { ICommentDocument } from '../types/IComment'
import BaseMapper from './BaseMapper'
import CommentMapper from './CommentMapper'

export default class TopPokemonMapper extends BaseMapper {
  static toResponse = (input: any) => this.map({
    pokemon: 'pokemon',
    comments: [
      {
        key: 'comments',
        transform: (comments: ICommentDocument[]) => CommentMapper.toResponse(comments)
      }
    ],
    userVotes: 'userVotes',
    position: 'position'
  }, input)
}
