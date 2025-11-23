import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { ArrowLeft, Upload } from 'lucide-react'
import * as React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authStore } from '@/lib/schemas/stores/auth-store'

export const Route = createFileRoute('/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  const state = useStore(authStore)
  if (!state) return null
  const { user, token } = state

  const navigate = useNavigate()
  const [imagePreview, setImagePreview] = React.useState<string>('')
  const [name, setName] = React.useState(user.username)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [image, setImage] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Profile updated:', { name, email, password, image })
    navigate({ to: '/dashboard' })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f3f0] p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/dashboard' })}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Dashboard
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Editar Perfil
          </h1>
          <p className="text-gray-600 mb-6">
            Actualiza tu información personal
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="flex flex-col items-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-dashed border-red-200">
              <Label className="text-sm font-semibold text-gray-900 mb-4">
                Imagen de Perfil
              </Label>
              {imagePreview && (
                <div className="mb-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
              )}
              <div className="w-full space-y-3">
                <label
                  htmlFor="image"
                  className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg border border-red-200 cursor-pointer hover:bg-red-50 transition"
                >
                  <Upload className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Selecciona una imagen
                  </span>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <Input
                  type="text"
                  placeholder="o pega una URL de imagen aquí"
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value)
                    setImagePreview(e.target.value)
                  }}
                  className="bg-white border-red-200 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Name Field */}
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-900"
              >
                Nombre de Usuario
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="mt-2"
              />
            </div>

            {/* Email Field */}
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-900"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="mt-2"
              />
            </div>

            {/* Password Field */}
            <div>
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-900"
              >
                Nueva Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Deja en blanco para no cambiar"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/dashboard' })}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-red-400 hover:bg-red-500 text-white"
              >
                Guardar Cambios
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
