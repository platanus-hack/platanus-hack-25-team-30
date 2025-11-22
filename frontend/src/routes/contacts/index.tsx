import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { ContactsHeader } from '@/components/contacts/ContactsHeader'
import { ContactsGrid } from '@/components/contacts/ContactsGrid'
import { contactsData } from '@/data/contact-data'
import { searchContactStore } from '@/lib/stores/contact-store'
import { useStore } from '@tanstack/react-store'

export const Route = createFileRoute('/contacts/')({
  component: RouteComponent,
})

function RouteComponent() {
  const searchValue = useStore(searchContactStore, (state) => state.searchValue)

  const filteredContacts = useMemo(() => {
    if (!searchValue) return contactsData

    const searchLower = searchValue.toLowerCase()
    return contactsData.filter((contact) =>
      contact.firstName.toLowerCase().includes(searchLower) ||
      contact.lastName.toLowerCase().includes(searchLower) ||
      contact.category.toLowerCase().includes(searchLower) ||
      contact.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    )
  }, [searchValue])

  return (
    <div className="min-h-screen bg-[#f5f3f0] p-8">
      <div className="max-w-7xl mx-auto">
        <ContactsHeader />
        <ContactsGrid contacts={filteredContacts} />
      </div>
    </div>
  )
}
