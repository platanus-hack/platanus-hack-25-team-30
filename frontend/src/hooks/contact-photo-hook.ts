import { useQuery } from '@tanstack/react-query'
import { contactsApi } from '@/integrations/api/contact-api'

export function useContactPhoto(contactId: number) {
  return useQuery({
    queryKey: ['contact-photo', contactId],
    queryFn: () => contactsApi.getPhoto(contactId),
  })
}
