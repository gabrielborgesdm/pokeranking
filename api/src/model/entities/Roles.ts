import { z } from 'zod'

export const RolesSchema = z.enum(['admin', 'user'])

export type Roles = z.infer<typeof RolesSchema>

export const RolesEnum = RolesSchema.enum
