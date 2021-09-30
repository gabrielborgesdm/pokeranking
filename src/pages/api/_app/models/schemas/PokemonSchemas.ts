import Joi from 'joi'

export const PokemonMutateSchema = Joi.object({
  pokemon: Joi.number().required(),
  note: Joi.string().max(100)
})

export const PokemonIdSchema = Joi.object({
  slug: Joi.number().required()
})

export const AddPokemonSchema = Joi.object({
  pokemon: Joi.object({
    name: Joi.string().max(100).required(),
    image: Joi.string().base64().required()
  })
})

export const UpdatePokemonSchema = Joi.object({
  pokemon: Joi.object({
    name: Joi.string().max(100),
    image: Joi.string().base64()
  })
})
