import Joi from 'joi'

export const ImageSchema = Joi.object({
  slug: Joi.string()
    .regex(/^[A-Za-z0-9-_]{3,}\.(?:png)$/i)
    .required()
})
