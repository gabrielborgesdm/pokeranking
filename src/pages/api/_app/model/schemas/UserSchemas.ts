import Joi from 'joi'
import { PokemonMutateSchema } from './PokemonSchemas'

export const UserAddSchema = Joi.object({
  user: Joi.object({
    username: Joi.string().max(30).required(),
    password: Joi.string().max(60).required(),
    email: Joi.string().email().max(70).required(),
    bio: Joi.string().max(250),
    pokemons: Joi.array().items(PokemonMutateSchema)
  }).required()
})

export const UserLoginSchema = Joi.object({
  username: Joi.string().max(30).required(),
  password: Joi.string().max(60).required()
})

export const UserUpdateSchema = Joi.object({
  user: Joi.object({
    password: Joi.string().max(60),
    bio: Joi.string().max(250),
    pokemons: Joi.array().items(PokemonMutateSchema)
  })
})
