import { ICommentResponse, ICommentDocument, ICommentQuery, ICommentRequest } from '../../../../configs/types/IComment'
import Comment from '../models/CommentModel'

export default class CommentRepository {
  async getAll() {
    let comments: Array<ICommentDocument> = null
    try {
      comments = await Comment.find().exec()
    } catch (error) {
      console.log(error)
    }
    return comments
  }

  async getById(_id: string): Promise<ICommentDocument> {
    let comment: ICommentDocument = null
    try {
      comment = await Comment.findOne({ _id }).exec()
    } catch (error) {
      console.log(error)
    }
    return comment
  }

  async get(query: ICommentQuery): Promise<ICommentDocument> {
    let comment: ICommentDocument = null
    try {
      comment = await Comment.findOne(query).exec()
    } catch (error) {
      console.log(error)
    }
    return comment
  }

  async getMany(query: ICommentQuery): Promise<ICommentDocument[]> {
    let comments: ICommentDocument[] = []
    try {
      comments = await Comment.find(query).exec()
    } catch (error) {
      console.log(error)
    }
    return comments
  }

  async delete(_id: string): Promise<ICommentDocument> {
    let comment: ICommentDocument = null
    try {
      comment = await Comment.findOneAndDelete({ _id }).exec()
    } catch (error) {
      console.log(error)
    }
    return comment
  }

  async store(payload: ICommentRequest): Promise<ICommentDocument> {
    let comment: ICommentDocument = null
    try {
      comment = await Comment.create(payload)
    } catch (error) {
      console.log(error)
    }
    return comment
  }

  async update(_id: string, payload: ICommentResponse): Promise<ICommentDocument> {
    let comment: ICommentDocument = null
    try {
      comment = await Comment.findOneAndUpdate({ _id }, payload, {
        new: true
      })
    } catch (error) {
      console.log(error)
    }
    return comment
  }
}
