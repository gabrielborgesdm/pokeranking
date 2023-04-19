import type Entities from './Entities'

export const MIGRATIONS_TABLE_NAME = 'Migrations'

export default interface Migration extends Entities {
  name: string
}
