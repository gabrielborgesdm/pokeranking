import Joi from 'joi'

export const PokemonMutateSchema = Joi.object({
  pokemon: Joi.number().required().min(1).max(809).required(),
  note: Joi.string().max(100)
})
