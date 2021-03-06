import Joi from 'joi'
import { UsernameRegex } from '../../../../../configs/Regex'
import { PokemonMutateSchema } from './PokemonSchemas'

export const UserAddSchema = Joi.object({
  user: Joi.object({
    username: Joi.string().max(30).required().regex(UsernameRegex),
    avatar: Joi.number().min(1),
    password: Joi.string().max(60).required(),
    email: Joi.string().email().max(70).required(),
    bio: Joi.string().max(250),
    pokemons: Joi.array().items(PokemonMutateSchema)
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
    avatar: Joi.number().min(1),
    bio: Joi.string().max(250),
    pokemons: Joi.array().items(PokemonMutateSchema)
  })
})

export const AuthPasswordRecoverySchema = Joi.object({
  email: Joi.string().email().max(70).required()
})

export const AuthConfirmPasswordRecoverySchema = Joi.object({
  accessToken: Joi.string().max(400).required(),
  password: Joi.string().max(60).required()
})
