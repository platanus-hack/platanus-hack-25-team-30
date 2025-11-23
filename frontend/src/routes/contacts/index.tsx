import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useStore } from '@tanstack/react-store'
import { ContactsHeader } from '@/components/contacts/ContactsHeader'
import { ContactsGrid } from '@/components/contacts/ContactsGrid'
import { searchContactStore } from '@/lib/stores/contact-store'
import { useContacts } from '@/hooks/contact-hook'
import { authStore } from '@/lib/stores/auth-store'

export const Route = createFileRoute('/contacts/')({
  component: RouteComponent,
})

function RouteComponent() {
  const authState = useStore(authStore)
  if (!authState) return null
  const { token } = authState

  const { contacts } = useContacts(token)
  const searchValue = useStore(searchContactStore, (state) => state.searchValue)

  const filteredContacts = useMemo(() => {
    if (!searchValue) return contacts

    const searchLower = searchValue.toLowerCase()
    return contacts.filter(
      (contact) =>
        contact.first_name.toLowerCase().includes(searchLower) ||
        contact.last_name.toLowerCase().includes(searchLower) ||
        contact.relationship_type.toLowerCase().includes(searchLower) ||
        contact.personality_tags.some((tag) =>
          tag.toLowerCase().includes(searchLower),
        ),
    )
  }, [searchValue, contacts])

  return (
    <div className="min-h-screen bg-(--app-secondary) p-8">
      <div className="max-w-7xl mx-auto">
        <ContactsHeader />
        <ContactsGrid contacts={filteredContacts} />
      </div>
    </div>
  )
}
