import { z } from 'zod'

export const BaseDomainSchema = z.object({
  _id: z.string().optional(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional()
})
