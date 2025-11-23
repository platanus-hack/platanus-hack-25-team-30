import { z } from 'zod'

export const ContactStatsSchema = z.object({
  healthScore: z.number().min(0).max(100),
  healthStatus: z.string(),
  totalInteractions: z.number(),
  lastContact: z.iso.datetime(),
  lastConversationTopic: z.string(),
  responseTimeMin: z.number(), // Number of minutes
  communicationBalance: z.number().min(0).max(1), // 0 to 1
})

export type ContactStats = z.infer<typeof ContactStatsSchema>

//
// interface AverageStats {
//   totalRelationships: number
//   averageHealthScore: number
//   interactionCountMonthly: number
//   needAttentionCount: number
// }
//
// interface ContactStats {
//   score: number
//   totalInteractions: number
//   lastContact: string
//   lastConversation: string
//   streak: number
//   responseTime: string
//   communicationBalance: string
//   healthStatus: string
// }
