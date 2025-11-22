import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { contactsApi } from '@/integrations/api/contact-api'
import { createContactPayload } from '@/lib/mappers/contact-mappers'
import type { CreateContactData } from '@/lib/schemas/contact-schema'

export function useContacts() {
  const queryClient = useQueryClient()

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateContactData) => {
      const payload = createContactPayload(data)
      return contactsApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: contactsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  return {
    contacts,
    isLoading,
    createContact: createMutation.mutate,
    deleteContact: deleteMutation.mutate,
    isCreating: createMutation.isPending,
  }
}