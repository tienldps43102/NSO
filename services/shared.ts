
import { z } from 'zod'

export const paginationInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(40).default(12),
})

export const computeSkipTake = (page: number, limit: number) => ({
  skip: (page - 1) * limit,
  take: limit,
})