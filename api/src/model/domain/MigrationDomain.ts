import { z } from 'zod'
import { BaseDomainSchema } from './BaseDomain'

export const MIGRATIONS_TABLE_NAME = 'Migrations'

export const MigrationSchema = BaseDomainSchema.extend({
  name: z.string()
})

export type Migration = z.infer<typeof MigrationSchema>
