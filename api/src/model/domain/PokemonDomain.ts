import { z } from 'zod'
import { BaseDomainSchema } from './BaseDomain'

export const POKEMON_TABLE_NAME = 'Pokemon'

export const PokemonSchema = BaseDomainSchema.extend({
  name: z.string(),
  image: z.string()
})

export type Pokemon = z.infer<typeof PokemonSchema>
