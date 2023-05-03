import { z } from 'zod'
import { EntitiesSchema } from './Entities'

export const POKEMON_TABLE_NAME = 'Pokemon'

export const PokemonSchema = EntitiesSchema.extend({
  name: z.string(),
  image: z.string()
})

export type Pokemon = z.infer<typeof PokemonSchema>
