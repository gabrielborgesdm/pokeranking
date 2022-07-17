import { ICommentDocument, ICommentResponse } from './IComment'
import { IModel } from './IModel'
import { IPokemon, IPokemonDocument } from './IPokemon'
import { IUserVote } from './IUserVotes'

export interface ITopPokemonDocument extends IModel {
  pokemon: IPokemonDocument,
  position: number,
  userVotes: IUserVote[],
  comments: ICommentDocument[],
}

export interface ITopPokemonResponse extends IModel {
  pokemon: IPokemonDocument,
  position: number,
  userVotes: IUserVote[],
  comments: ICommentResponse[],
}
