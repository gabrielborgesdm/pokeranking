import Joi from 'joi'
import { PokemonMutateSchema } from './PokemonSchemas'

export const UserAddSchema = Joi.object({
  user: Joi.object({
    username: Joi.string().max(30).required(),
    password: Joi.string().max(60).required(),
    email: Joi.string().email().max(70).required(),
    bio: Joi.string().max(250),
    pokemons: Joi.array().items(PokemonMutateSchema).max(809)
  }).required()
})

export const UserLoginSchema = Joi.object({
  email: Joi.string().email().max(70).required(),
  password: Joi.string().max(60).required()
})

export const UserUsernameSchema = Joi.object({
  slug: Joi.string().max(30).required()
})

export const UserUpdateSchema = Joi.object({
  user: Joi.object({
    password: Joi.string().max(60),
    bio: Joi.string().max(250),
    pokemons: Joi.array().items(PokemonMutateSchema).max(809)
  })
})
