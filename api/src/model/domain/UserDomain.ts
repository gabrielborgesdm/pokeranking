import { z } from 'zod'
import { PokemonSchema } from './PokemonDomain'
import { BaseDomainSchema } from './BaseDomain'
import { RolesSchema } from './RoleDomain'

export const USER_TABLE_NAME = 'Users'

export const UserPokemonSchema = z.object({
  note: z.string().optional(),
  pokemon: z.string().or(PokemonSchema)
})

export const UserSchema = BaseDomainSchema.extend({
  username: z.string(),
  avatar: z.string().or(PokemonSchema),
  email: z.string().optional(),
  bio: z.string().optional(),
  password: z.string().optional(),
  userPokemon: UserPokemonSchema.array().optional(),
  numberOfPokemons: z.number().optional(),
  role: RolesSchema.optional()
})

export type User = z.infer<typeof UserSchema>
export type UserPokemon = z.infer<typeof UserPokemonSchema>
