
import { useQuery } from '@tanstack/react-query'
import { contactsApi } from '@/integrations/api/contact-api'

export const useContactChats = (contactId: number) => {
  const { data: contactChats = [], isLoading } = useQuery({
    queryKey: ['contact-chats', contactId],
    queryFn: () => contactsApi.getChats(contactId),
  })

  return { contactChats, isLoading }
}