import { useState } from 'react'
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react'
import { useStore } from '@tanstack/react-store'
import { Button } from '@/components/ui/button'
import { useImportTelegram } from '@/hooks/import-hook'
import { useContacts } from '@/hooks/contact-hook'
import { authStore } from '@/lib/stores/auth-store'

export function TelegramImport() {
  const state = useStore(authStore)
  const token = state?.token ?? ''
  const [selectedContactId, setSelectedContactId] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { contacts, isLoading: isLoadingContacts } = useContacts(token)
  const importMutation = useImportTelegram()

  if (!state) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleImport = () => {
    if (!selectedContactId || !selectedFile) return

    importMutation.mutate(
      { contactId: selectedContactId, file: selectedFile },
      {
        onSuccess: () => {
          setSelectedContactId('')
          setSelectedFile(null)
        },
      },
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Importar Chat de Telegram
      </h2>
      <p className="text-gray-600 mb-6">
        Exporta tu chat desde Telegram y sube el archivo JSON aquí
      </p>

      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            Cómo exportar desde Telegram:
          </h3>
          <ol className="space-y-2 text-gray-700 list-decimal list-inside">
            <li>Abre Telegram Desktop en tu ordenador.</li>
            <li>Entra al chat (conversación privada) que quieres exportar.</li>
            <li>
              Haz clic en los tres puntos (⋮) en la esquina superior derecha y
              elige "Exportar historial de chat".
            </li>
            <li>
              En las opciones de exportación, desmarca todas las opciones
              (fotos, vídeos, archivos, stickers, etc.).
            </li>
            <li>En "Formato" selecciona "JSON".</li>
            <li>
              Ejecuta la exportación y guarda el archivo generado (result.json).
              Luego súbelo aquí.
            </li>
          </ol>
        </div>

        {/* Success/Error Messages */}
        {importMutation.isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="text-green-600 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-green-900">
                ¡Chat importado exitosamente!
              </p>
              <p className="text-sm text-green-700 mt-1">
                El chat se ha procesado y está disponible en tu lista de
                contactos.
              </p>
            </div>
          </div>
        )}

        {importMutation.isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <p className="font-medium text-red-900">Error al importar</p>
              <p className="text-sm text-red-700 mt-1">
                {importMutation.error.message ||
                  'Ocurrió un error al procesar el archivo'}
              </p>
            </div>
          </div>
        )}

        {/* Contact Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Contacto
          </label>
          <select
            value={selectedContactId}
            onChange={(e) => setSelectedContactId(e.target.value)}
            disabled={isLoadingContacts}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">¿Con quién es este chat?</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.first_name} {contact.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subir Exportación del Chat
          </label>
          <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 transition-colors">
            <Upload size={20} className="text-gray-400 mr-2" />
            <span className="text-gray-600">
              {selectedFile ? selectedFile.name : 'Elegir archivo...'}
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Acepta archivos .json exportados desde Telegram
          </p>
        </div>

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={
            !selectedContactId || !selectedFile || importMutation.isPending
          }
          className="w-full bg-pink-300 hover:bg-pink-400 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importMutation.isPending ? 'Importando...' : 'Importar Chat'}
        </Button>
      </div>
    </div>
  )
}
