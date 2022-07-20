import Joi from 'joi'

export const CommentIdSchema = Joi.object({
  slug: Joi.string().required()
})

export const AddCommentSchema = Joi.object({
  post: Joi.string().required(),
  user: Joi.string().required(),
  comment: Joi.string().required()
})

export const UpdateCommentSchema = Joi.object({
  comment: Joi.string().required()
})
