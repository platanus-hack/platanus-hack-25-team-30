
import { useQuery } from '@tanstack/react-query'
import { contactsApi } from '@/integrations/api/contact-api'

export const useContactChats = (contactId: number) => {
  return useQuery({
    queryKey: ['contact-chats', contactId],
    queryFn: () => contactsApi.getChats(contactId),
  })
}