import { Filter, Plus, Search } from 'lucide-react'
import { useStore } from '@tanstack/react-store'
import { useState } from 'react'
import { ContactForm } from './ContactForm'
import { searchContactStore } from '@/lib/stores/contact-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ContactsHeader() {
  const searchValue = useStore(searchContactStore, (state) => state.searchValue)
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Contactos</h1>
          <Button
            className="bg-red-400 hover:bg-red-500 text-white"
            onClick={() => setIsFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Contacto
          </Button>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contacts..."
              value={searchValue}
              onChange={(e) =>
                searchContactStore.setState((state) => ({
                  ...state,
                  searchValue: e.target.value,
                }))
              }
              className="pl-10 bg-white border-gray-200"
            />
          </div>
          <Button
            variant="outline"
            className="text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </div>

      {isFormOpen && <ContactForm onClose={() => setIsFormOpen(false)} />}
    </>
  )
}
