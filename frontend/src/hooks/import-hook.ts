import { useMutation, useQueryClient } from '@tanstack/react-query'
import { importApi } from '@/integrations/api/import-api'

export function useImportWhatsApp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contactId, file }: { contactId: string; file: File }) =>
      importApi.importWhatsApp(contactId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useImportTelegram() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contactId, file }: { contactId: string; file: File }) =>
      importApi.importTelegram(contactId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}
