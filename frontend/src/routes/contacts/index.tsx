import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useStore } from '@tanstack/react-store'
import { ContactsHeader } from '@/components/contacts/ContactsHeader'
import { ContactsGrid } from '@/components/contacts/ContactsGrid'
import { searchContactStore } from '@/lib/schemas/stores/contact-store'
import { useContacts } from '@/hooks/contact-hook'

export const Route = createFileRoute('/contacts/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { contacts } = useContacts()
  const searchValue = useStore(searchContactStore, (state) => state.searchValue)

  const filteredContacts = useMemo(() => {
    if (!searchValue) return contacts

    const searchLower = searchValue.toLowerCase()
    return contacts.filter(
      (contact) =>
        contact.firstName.toLowerCase().includes(searchLower) ||
        contact.lastName.toLowerCase().includes(searchLower) ||
        contact.category.toLowerCase().includes(searchLower) ||
        contact.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
    )
  }, [searchValue, contacts])

  return (
    <div className="min-h-screen bg-[#f5f3f0] p-8">
      <div className="max-w-7xl mx-auto">
        <ContactsHeader />
        <ContactsGrid contacts={filteredContacts} />
      </div>
    </div>
  )
}
