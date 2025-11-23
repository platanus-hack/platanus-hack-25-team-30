import { API_BASE_URL } from './load-env'
import type { Contact, CreateContactPayload } from '@/lib/types/contact-types'
import type { Chat } from '@/lib/types/chats-types'
import { ContactSchema } from '@/lib/types/contact-types'

export const contactsApi = {
  async create(
    payload: CreateContactPayload,
    userToken: string,
  ): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Token': userToken },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error('Failed to create contact')

    const data = await response.json()
    const parseContact = ContactSchema.parse(data)
    return parseContact
  },

  async assignPhoto(
    id: number,
    avatarFile: File,
    userToken: string,
  ): Promise<null> {
    const formData = new FormData()
    formData.append('person_photo', avatarFile)

    const response = await fetch(`${API_BASE_URL}/contacts/${id}/photo`, {
      method: 'POST',
      headers: { 'User-Token': userToken },
      body: formData,
    })

    if (!response.ok) throw new Error('Failed to assign photo to contact')

    return null
  },

  async getAll(userToken: string): Promise<Array<Contact>> {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      headers: { 'User-Token': userToken },
    })
    if (!response.ok) throw new Error('Failed to fetch contacts')

    const data = await response.json()

    const parsedContacts: Array<Contact> = ContactSchema.array().parse(data)

    return parsedContacts
  },

  async getPhoto(contactId: number, userToken: string): Promise<Blob | null> {
    const response = await fetch(
      `${API_BASE_URL}/contacts/${contactId}/photo`,
      {
        headers: { 'User-Token': userToken },
      },
    )

    if (response.status === 204) {
      return null
    }
    if (!response.ok) {
      throw new Error('Failed to fetch contact photo')
    }

    return response.blob()
  },

  async getChats(contactId: number, userToken: string): Promise<Array<Chat>> {
    const response = await fetch(
      `${API_BASE_URL}/contacts/${contactId}/records`,
      {
        headers: { 'User-Token': userToken },
      },
    )

    if (!response.ok) throw new Error('Failed to fetch contact chats')

    const data = await response.json()
    return data
  },

  async getById(id: string, userToken: string): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'GET',
      headers: { 'User-Token': userToken },
    })
    if (!response.ok) throw new Error('Failed to fetch contact')

    const data = await response.json()
    const parsedContact = ContactSchema.parse(data)
    return parsedContact
  },

  async update(
    id: number,
    payload: Partial<CreateContactPayload>,
    userToken: string,
  ): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'User-Token': userToken,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error('Failed to update contact')

    const data = await response.json()

    const parsedContact = ContactSchema.parse(data)
    return parsedContact
  },

  async delete(id: number, userToken: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'DELETE',
      headers: { 'User-Token': userToken },
    })

    if (!response.ok) throw new Error('Failed to delete contact')
  },
}
