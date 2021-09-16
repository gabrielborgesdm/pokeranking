import Joi from 'joi'
import { NUMBER_POKEMONS } from '../../../../../configs/APIConfig'

export const PokemonMutateSchema = Joi.object({
  pokemon: Joi.number().required().min(1).max(NUMBER_POKEMONS),
  note: Joi.string().max(100)
})
