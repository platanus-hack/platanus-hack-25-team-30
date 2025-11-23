import { useQueries } from '@tanstack/react-query'
import { contactsApi } from '@/integrations/api/contact-api'
import type { Stats } from '@/lib/types/stats-types'
import type { Contact } from '@/lib/types/contact-types'

export const useAllContactsStats = (contacts: Contact[], userToken: string) => {
  const queries = useQueries({
    queries: contacts.map((contact) => ({
      queryKey: ['contact-stats', contact.id],
      queryFn: () => contactsApi.getStats(contact.id, userToken),
      enabled: !!userToken && contacts.length > 0,
    })),
  })

  const isLoading = queries.some((query) => query.isLoading)
  const isError = queries.some((query) => query.isError)

  const statsMap = new Map<number, Stats>()
  contacts.forEach((contact, index) => {
    const queryResult = queries[index]
    if (queryResult?.data) {
      statsMap.set(contact.id, queryResult.data)
    }
  })

  return { statsMap, isLoading, isError }
}
