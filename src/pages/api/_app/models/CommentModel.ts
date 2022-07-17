import mongoose from '../../../../configs/DatabaseConfig'
import { ICommentDocument } from '../../../../configs/types/IComment'

const commentSchema = new mongoose.Schema<ICommentDocument>({
  post: { type: mongoose.Schema.Types.ObjectId, require: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', require: true },
  comment: { type: String, require: true }
}, {
  toJSON: { virtuals: true }
})

commentSchema.virtual('TopPokemons', {
  ref: 'TopPokemons',
  localField: 'post',
  foreignField: '_id',
  justOne: true
})

const Comment =
  mongoose.models.Comments ||
  mongoose.model<ICommentDocument>('Comments', commentSchema)
export default Comment
