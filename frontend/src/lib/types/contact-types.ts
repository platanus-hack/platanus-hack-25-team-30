export interface Contact {
  id: string
  firstName: string
  lastName: string
  avatar?: File
  category: string
  email: string
  phone: string
  birthday: string
  score: number
  lastContact: string
  lastConversation: string
  totalInteractions: number
  tags: Array<string>
  notes: string
}

export interface CreateContactPayload {
  first_name: string
  last_name: string
  relationship_type: string
  email: string
  phone: string
  birthday: string
  personality_tags: Array<string>
  notes: string
}
