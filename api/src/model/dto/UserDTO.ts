import { type z } from 'zod'
import { UserSchema } from '../domain/UserDomain'
import { getBaseDomainFieldsToHide } from '../../helper/DTOHelper'

export const UserRequestDTOSchema = UserSchema.omit({
  ...getBaseDomainFieldsToHide(),
  numberOfPokemons: true,
  role: true,
  password: true
})

export type UserRequestDTO = z.infer<typeof UserRequestDTOSchema>
