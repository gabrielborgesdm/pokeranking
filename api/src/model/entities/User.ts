import type Entities from './Entities'
import type Pokemon from './Pokemon'

export const USER_TABLE_NAME = 'Users'

export default interface User extends Entities {
  username: string
  avatar: Pokemon
  email?: string
  bio?: string
  password?: string
  pokemon?: UserPokemon[]
  numberOfPokemons?: number
  role?: string
}

interface UserPokemon {
  note?: string
  pokemon: string
}
