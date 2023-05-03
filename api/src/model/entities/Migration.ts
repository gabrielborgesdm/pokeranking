import { z } from 'zod'
import { EntitiesSchema } from './Entities'

export const MIGRATIONS_TABLE_NAME = 'Migrations'

export const MigrationSchema = EntitiesSchema.extend({
  name: z.string()
})

export type Migration = z.infer<typeof MigrationSchema>
