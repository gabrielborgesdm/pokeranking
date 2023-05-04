import { z } from 'zod'
import { PokemonSchema } from './Pokemon'
import { EntitiesSchema } from './Entities'
import { RolesSchema } from './Roles'

export const USER_TABLE_NAME = 'Users'

export const UserPokemonSchema = z.object({
  note: z.string().optional(),
  pokemon: z.string()
})

export const UserSchema = EntitiesSchema.extend({
  username: z.string(),
  avatar: PokemonSchema,
  email: z.string().optional(),
  bio: z.string().optional(),
  password: z.string().optional(),
  pokemon: UserPokemonSchema.array().optional(),
  numberOfPokemons: z.number().optional(),
  role: RolesSchema.optional()
})

export type User = z.infer<typeof UserSchema>
export type UserPokemon = z.infer<typeof UserPokemonSchema>
