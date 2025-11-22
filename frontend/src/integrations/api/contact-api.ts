import type { Contact, CreateContactPayload } from '@/lib/types/contact-types'
import { getContact } from '@/lib/mappers/contact-mappers'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const contactsApi = {
  async create(payload: CreateContactPayload): Promise<Contact> {
    console.log('Creating contact with payload:', payload)
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'user-token': 'test' },
      body: JSON.stringify(payload),
    })
    console.log('Response status:', response.status)
    if (!response.ok) throw new Error('Failed to create contact')

    const data = await response.json()
    return getContact(data)
  },

  async getAll(): Promise<Array<Contact>> {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      headers: { 'user-token': 'test' },
    })
    if (!response.ok) throw new Error('Failed to fetch contacts')

    const data = await response.json()
    return data.map(getContact)
  },

  async getById(id: string): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`)
    if (!response.ok) throw new Error('Failed to fetch contact')

    const data = await response.json()
    return getContact(data)
  },

  async update(
    id: string,
    payload: Partial<CreateContactPayload>,
  ): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error('Failed to update contact')

    const data = await response.json()
    return getContact(data)
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/contacts/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) throw new Error('Failed to delete contact')
  },
}
