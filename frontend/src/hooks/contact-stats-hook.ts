import { useQuery } from '@tanstack/react-query'
import { contactsApi } from '@/integrations/api/contact-api'

export const useContactStats = (contactId: number, userToken: string) => {
  const { data: contactStats = null, isLoading } = useQuery({
    queryKey: ['contact-stats', contactId],
    queryFn: () => contactsApi.getStats(contactId, userToken),
  })

  return { contactStats, isLoading }
}
