import { z } from 'zod'

export const BaseDomainFields = {
  _id: z.string().optional(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional()
}

export const BaseDomainSchema = z.object(BaseDomainFields)
