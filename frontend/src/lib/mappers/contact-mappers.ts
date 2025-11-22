import type { CreateContactData } from '@/lib/schemas/contact-schema'
import type { CreateContactPayload, Contact } from '@/lib/types/contact-types'

export function createContactPayload(data: CreateContactData): CreateContactPayload {
  return {
    first_name: data.firstName,
    last_name: data.lastName,
    relationship_type: data.relationshipType,
    email: data.email,
    phone: data.phone,
    birthday: data.birthday,
    personality_tags: data.personalityTags,
    notes: data.notes,
  }
}

export function getContact(apiResponse: any): Contact {
  return {
    id: apiResponse.id,
    firstName: apiResponse.first_name,
    lastName: apiResponse.last_name,
    avatar: apiResponse.avatar,
    category: apiResponse.relationship_type,
    score: apiResponse.score,
    lastContact: apiResponse.last_contact,
    lastConversation: apiResponse.last_conversation,
    totalInteractions: apiResponse.total_interactions,
    tags: apiResponse.personality_tags,
  }
}