import { ContactCard } from './ContactCard'
import type { Contact } from '@/lib/types/contact-types'

interface ContactsGridProps {
  contacts: Array<Contact>
}

export function ContactsGrid({ contacts }: ContactsGridProps) {
  console.log('Rendering ContactsGrid with contacts:', contacts)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          score={10}
          lastConversation="xd"
        />
      ))}
    </div>
  )
}
