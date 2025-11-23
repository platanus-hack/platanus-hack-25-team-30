import { z } from 'zod'

export const ContactSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  relationship_type: z.string(),
  birthday: z.string(),
  personality_tags: z.array(z.string()),
  notes: z.string(),
})

export type Contact = z.infer<typeof ContactSchema>

// export interface Contact {
//   id: string
//   firstName: string
//   lastName: string
//   avatar: string
//   category: string
//   email: string
//   phone: string
//   birthday: string
//   score: number
//   lastContact: string
//   lastConversation: string
//   totalInteractions: number
//   tags: Array<string>
//   notes: string
// }

export interface CreateContactPayload {
  first_name: string
  last_name: string
  relationship_type: string
  birthday: string
  personality_tags: Array<string>
  notes: string
}
