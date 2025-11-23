import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateContactData } from '@/lib/schemas/contact-schema'
import { contactsApi } from '@/integrations/api/contact-api'
import {
  createContactPayload,
  updateContactPayload,
} from '@/lib/mappers/contact-mappers'

export function useContacts() {
  const queryClient = useQueryClient()

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: async (data: CreateContactData) => {
      const payload = createContactPayload(data)
      const contact = await contactsApi.create(payload)
      if (data.avatar) {
        return await contactsApi.assignPhoto(contact.id, data.avatar)
      }
      return contact
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<CreateContactData> }) => {
      const payload = updateContactPayload(data.updates)
      return contactsApi.update(data.id, payload)
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
    updateContact: updateMutation.mutate,
    deleteContact: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}
