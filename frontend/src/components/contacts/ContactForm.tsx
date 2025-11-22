import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import * as ShadcnSelect from '@/components/ui/select'
import { useForm } from '@tanstack/react-form'
import {
  CreateContactSchema,
  type CreateContactData,
} from '@/lib/schemas/contact-schema'
import { X, Upload } from 'lucide-react'
import { useContacts } from '@/hooks/contact-hook'
import * as React from 'react'

import { type Contact } from '@/lib/types/contact-types'

interface ContactFormProps {
  onClose: () => void
  contact?: Contact
}

export function ContactForm({ onClose, contact }: ContactFormProps) {
  const { createContact, updateContact, isCreating, isUpdating } = useContacts()

  const isEditMode = !!contact

  const [imagePreview, setImagePreview] = React.useState<string>(
    contact?.avatar || '',
  )

  const form = useForm({
    defaultValues: {
      avatar: contact?.avatar || '',
      firstName: contact?.firstName || '',
      lastName: contact?.lastName || '',
      relationshipType: (contact?.category as any) || 'Familia',
      email: contact?.email || '',
      phone: contact?.phone || '',
      birthday: contact?.birthday || '',
      personalityTags: contact?.tags || [],
      notes: contact?.notes || '',
    },
    onSubmit: async ({ value }) => {
      const result = CreateContactSchema.safeParse(value)
      if (!result.success) {
        console.error('Validation failed:', result.error)
        return
      }

      const dataWithAvatar = {
        ...result.data,
        avatar: value.avatar || imagePreview,
      }

      if (isEditMode && contact) {
        updateContact(
          {
            id: contact.id,
            updates: dataWithAvatar,
          },
          {
            onSuccess: () => {
              onClose()
            },
          },
        )
      } else {
        createContact(dataWithAvatar, {
          onSuccess: () => {
            onClose()
          },
        })
      }
    },
  })

  const relationshipTypes = [
    { label: 'Familia', value: 'Familia' },
    { label: 'Amigo Cercano', value: 'Amigo Cercano' },
    { label: 'Amigo', value: 'Amigo' },
    { label: 'Colega', value: 'Colega' },
    { label: 'Romantico', value: 'Romantico' },
    { label: 'Conocido', value: 'Conocido' },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {isEditMode ? 'Editar Contacto' : 'Agregar Nuevo Contacto'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isEditMode
                ? 'Edita la información de este contacto.'
                : 'Agrega una nueva persona para hacer seguimiento a tu relación con ella'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="p-6 space-y-6"
        >
          {/* Image Input */}
          <form.Field name="avatar">
            {(field) => (
              <div className="flex flex-col items-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg border-2 border-dashed border-red-200">
                <Label
                  htmlFor="avatar"
                  className="text-sm font-semibold text-gray-900 mb-4"
                >
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
                    htmlFor="avatar"
                    className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg border border-red-200 cursor-pointer hover:bg-red-50 transition"
                  >
                    <Upload className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Selecciona una imagen
                    </span>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setImagePreview(reader.result as string)
                            field.handleChange(reader.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <Input
                    type="text"
                    placeholder="o pega una URL de imagen aquí"
                    value={field.state.value || ''}
                    onChange={(e) => {
                      setImagePreview(e.target.value)
                      field.handleChange(e.target.value)
                    }}
                    className="bg-white border-red-200 placeholder-gray-400"
                  />
                </div>
                {field.state.meta.errors && field.state.meta.isTouched && (
                  <p className="text-sm text-red-600 mt-3 font-medium">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>
          {/* Name Field */}
          <form.Field name="firstName">
            {(field) => (
              <div>
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-900"
                >
                  Nombre *
                </Label>
                <Input
                  id="firstName"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="John Doe"
                  className="mt-2"
                />
                {field.state.meta.errors && field.state.meta.isTouched && (
                  <p className="text-sm text-red-500 mt-1">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Last Name Field */}
          <form.Field name="lastName">
            {(field) => (
              <div>
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-900"
                >
                  Apellido *
                </Label>
                <Input
                  id="lastName"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Smith"
                  className="mt-2"
                />
                {field.state.meta.errors && field.state.meta.isTouched && (
                  <p className="text-sm text-red-500 mt-1">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Relationship Type */}
          <form.Field name="relationshipType">
            {(field) => (
              <div>
                <Label
                  htmlFor="relationshipType"
                  className="text-sm font-medium text-gray-900"
                >
                  Tipo de Relación *
                </Label>
                <ShadcnSelect.Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as any)}
                >
                  <ShadcnSelect.SelectTrigger className="mt-2">
                    <ShadcnSelect.SelectValue placeholder="Select type" />
                  </ShadcnSelect.SelectTrigger>
                  <ShadcnSelect.SelectContent>
                    {relationshipTypes.map((type) => (
                      <ShadcnSelect.SelectItem
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </ShadcnSelect.SelectItem>
                    ))}
                  </ShadcnSelect.SelectContent>
                </ShadcnSelect.Select>
                {field.state.meta.errors && field.state.meta.isTouched && (
                  <p className="text-sm text-red-500 mt-1">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Email */}
          <form.Field name="email">
            {(field) => (
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
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="john@example.com"
                  className="mt-2"
                />
                {field.state.meta.errors && field.state.meta.isTouched && (
                  <p className="text-sm text-red-500 mt-1">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Phone */}
          <form.Field name="phone">
            {(field) => (
              <div>
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-900"
                >
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="+1 234-567-8900"
                  className="mt-2"
                />
                {field.state.meta.errors && field.state.meta.isTouched && (
                  <p className="text-sm text-red-500 mt-1">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Birthday */}
          <form.Field name="birthday">
            {(field) => (
              <div>
                <Label
                  htmlFor="birthday"
                  className="text-sm font-medium text-gray-900"
                >
                  Cumpleaños
                </Label>
                <Input
                  id="birthday"
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="mt-2"
                />
                {field.state.meta.errors && field.state.meta.isTouched && (
                  <p className="text-sm text-red-500 mt-1">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Personality Tags */}
          <form.Field name="personalityTags">
            {(field) => (
              <div>
                <Label
                  htmlFor="personalityTags"
                  className="text-sm font-medium text-gray-900"
                >
                  Etiquetas de Personalidad
                </Label>
                <Input
                  id="personalityTags"
                  value={field.state.value.join(', ')}
                  onChange={(e) => {
                    const tags = e.target.value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter((tag) => tag.length > 0)
                    field.handleChange(tags)
                  }}
                  onBlur={field.handleBlur}
                  placeholder="Introvertido, Amante de los libros, Experto en tecnología (separados por comas)"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Agrega rasgos para ayudar a la IA a entender su personalidad
                </p>
                {field.state.meta.errors && field.state.meta.isTouched && (
                  <p className="text-sm text-red-500 mt-1">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Notes */}
          <form.Field name="notes">
            {(field) => (
              <div>
                <Label
                  htmlFor="notes"
                  className="text-sm font-medium text-gray-900"
                >
                  Notas
                </Label>
                <Textarea
                  id="notes"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Important information about this person..."
                  rows={4}
                  className="mt-2"
                />
                {field.state.meta.errors && field.state.meta.isTouched && (
                  <p className="text-sm text-red-500 mt-1">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <form.Subscribe
              selector={(state) => ({ isSubmitting: state.isSubmitting })}
            >
              {({ isSubmitting }) => (
                <Button
                  type="submit"
                  disabled={isSubmitting || isCreating || isUpdating}
                  className="bg-red-400 hover:bg-red-500 text-white cursor-pointer"
                >
                  {isEditMode ? 'Guardar Cambios' : 'Agregar Contacto'}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </div>
  )
}
