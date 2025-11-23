import { z } from 'zod'

export const ChatSchema = z.object({
  id: z.number(),
  sent_from: z.string(),
  source: z.string(),
  time: z.string(),
  message_text: z.string(),
})

export type Chat = z.infer<typeof ChatSchema>