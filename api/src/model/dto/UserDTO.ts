import { type z } from 'zod'
import { UserSchema } from '../domain/UserDomain'

export const UserRequestDTOSchema = UserSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
  numberOfPokemons: true,
  role: true,
  password: true
})

export type UserRequestDTO = z.infer<typeof UserRequestDTOSchema>
