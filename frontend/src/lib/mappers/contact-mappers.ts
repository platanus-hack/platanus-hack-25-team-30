import type { CreateContactData } from '@/lib/schemas/contact-schema'
import type { CreateContactPayload } from '@/lib/types/contact-types'

export function createContactPayload(
  data: CreateContactData,
): CreateContactPayload {
  return {
    first_name: data.firstName,
    last_name: data.lastName,
    relationship_type: data.relationshipType,
    email: data.email || '',
    phone: data.phone || '',
    birthday: data.birthday || '',
    personality_tags: data.personalityTags,
    notes: data.notes || '',
  }
}

export function updateContactPayload(
  data: Partial<CreateContactData>,
): Partial<CreateContactPayload> {
  const payload: Partial<CreateContactPayload> = {}

  if (data.firstName !== undefined) {
    payload.first_name = data.firstName
  }
  if (data.lastName !== undefined) {
    payload.last_name = data.lastName
  }
  if (data.relationshipType !== undefined) {
    payload.relationship_type = data.relationshipType
  }
  if (data.email !== undefined) {
    payload.email = data.email
  }
  if (data.phone !== undefined) {
    payload.phone = data.phone
  }
  if (data.birthday !== undefined) {
    payload.birthday = data.birthday
  }
  if (data.personalityTags !== undefined) {
    payload.personality_tags = data.personalityTags
  }
  if (data.notes !== undefined) {
    payload.notes = data.notes
  }

  return payload
}
