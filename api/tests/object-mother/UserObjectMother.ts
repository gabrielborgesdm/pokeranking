import { RolesEnum } from '../../src/model/domain/RoleDomain'
import { type User, type UserPokemon } from '../../src/model/domain/UserDomain'
import { UserRequestDTOSchema } from '../../src/model/dto/UserDTO'
import { makePokemon } from './PokemonObjectMother'

export const makeUser = (payload: Partial<User> = {}): User => {
  const defaultUser = {
    _id: '41224d776a326fb40f000002',
    username: 'john',
    avatar: makePokemon(),
    email: 'john@gmail.com',
    bio: 'I\'m a person, I think',
    password: 'Isthis@apassword?',
    userPokemon: [],
    numberOfPokemons: 1,
    role: RolesEnum.admin
  }

  return { ...defaultUser, ...payload }
}

export const makeUserPokemon = (): UserPokemon => ({
  note: 'It\'s a nice pokemon',
  pokemon: makePokemon()._id as string
})

export const makeUserCreationPayload = (payload: Partial<User> = {}): User => {
  const user = makeUser(payload)

  if (typeof user.avatar !== 'string') {
    user.avatar = makePokemon()._id as string
  }

  return UserRequestDTOSchema.parse(user)
}
