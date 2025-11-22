export interface Contact {
  id: string
  firstName: string
  lastName: string
  avatar: string
  category: string
  email: string
  phone: string
  birthday: string
  score: number
  lastContact: string
  lastConversation: string
  totalInteractions: number
  tags: string[]
  notes: string
}

export interface CreateContactPayload {
  first_name: string,
  last_name: string,
  relationship_type: string,
  email: string,
  phone: string,
  birthday: string,
  personality_tags: string[],
  notes: string,
}