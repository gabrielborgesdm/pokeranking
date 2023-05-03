import { z } from 'zod'

export const EntitiesSchema = z.object({
  _id: z.string().optional(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional()
})

export type Entities = z.infer<typeof EntitiesSchema>
