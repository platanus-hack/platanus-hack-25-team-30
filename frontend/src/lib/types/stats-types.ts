import { z } from 'zod'

export const StatsSchema = z.object({
  health_score: z.number().min(0).max(100),
  health_status: z.string(),
  total_interactions: z.number(),
  last_interaction_date: z.iso.datetime(),
  last_conversation_topic: z.string(),
  response_time_median_min: z.number(),
  communication_balance: z.number().min(0).max(1),
})

export type Stats = z.infer<typeof StatsSchema>