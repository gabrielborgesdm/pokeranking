import type Entities from './Entities'

export const POKEMON_TABLE_NAME = 'Pokemon'

export default interface Pokemon extends Entities {
  name: string
  image: string
}
