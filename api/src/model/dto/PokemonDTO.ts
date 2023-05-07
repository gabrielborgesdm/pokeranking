import { z } from 'zod'
import { PokemonSchema } from '../domain/PokemonDomain'
import { getBaseDomainFieldsToHide } from '../../helper/DTOHelper'
import { File } from 'buffer'

export const PokemonRequestDTOSchema = PokemonSchema.extend({
  image: z.any().refine((image: any) => typeof image === typeof File).or(z.string())
}).omit(getBaseDomainFieldsToHide())

export type PokemonRequestDTO = z.infer<typeof PokemonRequestDTOSchema>
