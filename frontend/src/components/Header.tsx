import { Link } from '@tanstack/react-router'

import { useState } from 'react'
import {
  Users,
  LayoutDashboard,
  Menu,
  BarChart3,
  Upload,
  X,
} from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className="p-4 flex items-center bg-white border-b border-gray-200 shadow-sm">
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
            to="/"
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
