import { useQuery } from '@tanstack/react-query'
import { contactsApi } from '@/integrations/api/contact-api'

export function useContactPhoto(contactId: string) {
  return useQuery({
    queryKey: ['contact-photo', contactId],
    queryFn: () => contactsApi.getPhoto(contactId),
  })
}