import { API_BASE_URL } from './load-env'

export const importApi = {
  async importWhatsApp(
    contactId: string,
    file: File,
    userToken: string,
  ): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('contact_id', contactId)

    const response = await fetch(
      `${API_BASE_URL}/contacts/${contactId}/records/integrations/whatsapp/upload`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'User-Token': userToken,
        },
      },
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to import WhatsApp chat')
    }

    return response.json()
  },

  async importTelegram(contactId: string, file: File): Promise<void> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('contact_id', contactId)

    const response = await fetch(`${API_BASE_URL}/import/telegram`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to import Telegram chat')
    }

    return response.json()
  },
}
