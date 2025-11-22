import { Link, useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'

import { useState } from 'react'
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  Upload,
  User as UserIcon,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { authActions, authStore } from '@/lib/stores/auth-store'
import { Card } from '@/components/ui/card'

export default function Header() {
  const state = useStore(authStore)
  if (!state) return null
  const { user, token } = state

  const [isOpen, setIsOpen] = useState(false)
  const [isUserOpen, setIsUserOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <header className="p-4 flex items-center justify-between bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-900">
            DeepBonds
          </h1>
        </div>

        {/* User Options */}
        {
          <Popover open={isUserOpen} onOpenChange={setIsUserOpen}>
            <PopoverTrigger asChild>
              <Card className="p-3 cursor-pointer hover:shadow-md transition-shadow flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                <div className="w-10 h-10 rounded-full bg-red-400 flex items-center justify-center text-white">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.username}
                  </p>
                </div>
              </Card>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-2">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  className="justify-start gap-2 text-sm font-normal"
                  onClick={() => {
                    setIsUserOpen(false)
                    navigate({ to: '/profile' })
                  }}
                >
                  <UserIcon className="h-4 w-4" />
                  Editar Perfil
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start gap-2 text-sm font-normal text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    authActions.logout()
                    setIsUserOpen(false)
                    navigate({ to: '/login' })
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        }
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 backdrop-blur-xs z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-white border-r border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-end p-6 border-b border-gray-200">
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 cursor-pointer"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors mb-2 text-gray-700"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-red-400 hover:bg-red-500 transition-colors mb-2 text-white',
            }}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            to="/contacts"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors mb-2 text-gray-700"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-red-400 hover:bg-red-500 transition-colors mb-2 text-white',
            }}
          >
            <Users size={20} />
            <span className="font-medium">Contactos</span>
          </Link>

          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors mb-2 text-gray-700"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-red-400 hover:bg-red-500 transition-colors mb-2 text-white',
            }}
          >
            <BarChart3 size={20} />
            <span className="font-medium">Analíticas</span>
          </Link>

          <Link
            to="/import"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors mb-2 text-gray-700"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-red-400 hover:bg-red-500 transition-colors mb-2 text-white',
            }}
          >
            <Upload size={20} />
            <span className="font-medium">Importar</span>
          </Link>
        </nav>
      </aside>
    </>
  )
}
