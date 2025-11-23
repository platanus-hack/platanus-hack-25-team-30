import { useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useImportWhatsApp } from '@/hooks/import-hook'
import { useContacts } from '@/hooks/contact-hook'
import { authStore } from '@/lib/stores/auth-store'

export function WhatsAppImport() {
  const state = useStore(authStore)
  const token = state?.token ?? ''
  const [selectedContactId, setSelectedContactId] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const { contacts, isLoading: isLoadingContacts } = useContacts(token)
  const importMutation = useImportWhatsApp(token)

  if (!state) return null

  const validateAndExtractFile = async (file: File): Promise<File | null> => {
    setFileError(null)

    if (file.name.endsWith('.txt')) {
      return file
    }

    if (file.name.endsWith('.zip')) {
      try {
        const JSZip = (await import('jszip')).default
        const zip = new JSZip()
        const contents = await zip.loadAsync(file)

        const files = Object.keys(contents.files).filter(
          (name) => !contents.files[name].dir,
        )

        if (files.length === 0) {
          setFileError('El archivo ZIP está vacío')
          return null
        }

        if (files.length > 1) {
          setFileError('El archivo ZIP debe contener solo un archivo .txt')
          return null
        }

        if (!files[0].endsWith('.txt')) {
          setFileError('El archivo dentro del ZIP debe ser un .txt')
          return null
        }

        const txtFileName = files[0]
        const txtFileContent = await contents.files[txtFileName].async('blob')

        const extractedFile = new File([txtFileContent], txtFileName, {
          type: 'text/plain',
        })

        return extractedFile
      } catch (error) {
        setFileError('Error al leer el archivo ZIP')
        return null
      }
    }

    setFileError('Solo se aceptan archivos .txt o .zip')
    return null
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0]
      const extractedFile = await validateAndExtractFile(file)

      if (extractedFile) {
        setSelectedFile(extractedFile)
      } else {
        setSelectedFile(null)
        e.target.value = ''
      }
    }
  }

  const handleImport = () => {
    if (!selectedContactId || !selectedFile) return

    importMutation.mutate(
      {
        contactId: selectedContactId,
        file: selectedFile,
        userToken: token,
      },
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
        Importar Chat de WhatsApp
      </h2>
      <p className="text-gray-600 mb-6">
        Exporta tu chat desde WhatsApp y sube el archivo .txt aquí
      </p>

      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            Cómo exportar desde WhatsApp:
          </h3>
          <ol className="space-y-2 text-gray-700 list-decimal list-inside">
            <li>Abre WhatsApp en tu teléfono</li>
            <li>Ve al chat que deseas exportar</li>
            <li>
              Toca en Informacion del contacto → Exportar chat → Sin media
            </li>
            <li>
              Sube el archivo ZIP descargado o el archivo .txt (si lo
              descomprimiste)
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
                {importMutation.error.message}
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
              accept=".txt,.zip"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Acepta archivos .txt o .zip exportados desde WhatsApp
          </p>
          {fileError && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <AlertCircle size={16} />
              {fileError}
            </p>
          )}
        </div>

        {/* Import Button */}
        <Button
          onClick={handleImport}
          disabled={
            !selectedContactId || !selectedFile || importMutation.isPending
          }
          className="w-full bg-pink-300 hover:bg-pink-400 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {importMutation.isPending ? 'Importando...' : 'Importar Chat'}
        </Button>
      </div>
    </div>
  )
}
