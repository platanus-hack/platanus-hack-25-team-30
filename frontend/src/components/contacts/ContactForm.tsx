import { useForm, useStore } from '@tanstack/react-form'
import { AlertCircle, Upload, X } from 'lucide-react'
import { useState } from 'react'
import type { Contact } from '@/lib/types/contact-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import * as ShadcnSelect from '@/components/ui/select'
import { CreateContactSchema } from '@/lib/schemas/contact-schema'
import { useContacts } from '@/hooks/contact-hook'
import { authStore } from '@/lib/stores/auth-store'

interface ContactFormProps {
  onClose: () => void
  contact?: Contact
  avatar?: File
}

export function ContactForm({ onClose, contact, avatar }: ContactFormProps) {
  const state = useStore(authStore)
  if (!state) return null
  const { token } = state
  const { createContact, updateContact, isCreating, isUpdating } =
    useContacts(token)

  const isEditMode = !!contact

  const [selectedFile, setSelectedFile] = useState<File | undefined>(avatar)

  const [tagInputValue, setTagInputValue] = useState('')

  const form = useForm({
    defaultValues: {
      avatar: avatar || undefined,
      firstName: contact?.first_name || '',
      lastName: contact?.last_name || '',
      relationshipType: contact?.relationship_type || 'Familia',
      email: contact?.email || '',
      phone: contact?.phone || '',
      birthday: contact?.birthday || '',
      personalityTags: contact?.personality_tags || [],
      notes: contact?.notes || '',
    },
    onSubmit: ({ value }) => {
      const result = CreateContactSchema.safeParse(value)
      if (!result.success) {
        console.error('Validation failed:', result.error)
        return
      }

      const dataWithAvatar = {
        ...result.data,
        avatar: value.avatar || selectedFile,
      }

      if (isEditMode) {
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
              <div className="flex flex-col items-center p-6 bg-linear-to-br from-red-50 to-orange-50 rounded-lg border-2 border-dashed border-red-200">
                <Label
                  htmlFor="avatar"
                  className="text-sm font-semibold text-gray-900 mb-4"
                >
                  Imagen de Perfil
                </Label>
                {selectedFile && (
                  <div className="mb-4">
                    <img
                      src={URL.createObjectURL(selectedFile)}
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
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setSelectedFile(file)
                          field.handleChange(file)
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {field.state.meta.errors.length > 0 &&
                  field.state.meta.isTouched && (
                    <div className="flex items-start gap-2 mt-3 text-red-600">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p className="text-sm font-medium">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    </div>
                  )}
              </div>
            )}
          </form.Field>

          {/* Name Field */}
          <form.Field
            name="firstName"
            validators={{
              onChange: ({ value }) => {
                const result =
                  CreateContactSchema.shape.firstName.safeParse(value)
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message
              },
            }}
          >
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
                  className={`mt-2 ${
                    field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : ''
                  }`}
                />
                {field.state.meta.errors.length > 0 &&
                  field.state.meta.isTouched && (
                    <div className="flex items-start gap-2 mt-2 text-red-600">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p className="text-sm">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    </div>
                  )}
              </div>
            )}
          </form.Field>

          {/* Last Name Field */}
          <form.Field
            name="lastName"
            validators={{
              onChange: ({ value }) => {
                const result =
                  CreateContactSchema.shape.lastName.safeParse(value)
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message
              },
            }}
          >
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
                  className={`mt-2 ${
                    field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : ''
                  }`}
                />
                {field.state.meta.errors.length > 0 &&
                  field.state.meta.isTouched && (
                    <div className="flex items-start gap-2 mt-2 text-red-600">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p className="text-sm">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    </div>
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
                  <ShadcnSelect.SelectTrigger
                    className={`mt-2 ${
                      field.state.meta.errors.length > 0 &&
                      field.state.meta.isTouched
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : ''
                    }`}
                  >
                    <ShadcnSelect.SelectValue placeholder="Selecciona un tipo" />
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
                {field.state.meta.errors.length > 0 &&
                  field.state.meta.isTouched && (
                    <div className="flex items-start gap-2 mt-2 text-red-600">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p className="text-sm">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    </div>
                  )}
              </div>
            )}
          </form.Field>

          {/* Email */}
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return undefined // email is optional
                const result = CreateContactSchema.shape.email.safeParse(value)
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message
              },
            }}
          >
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
                  className={`mt-2 ${
                    field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : ''
                  }`}
                />
                {field.state.meta.errors.length > 0 &&
                  field.state.meta.isTouched && (
                    <div className="flex items-start gap-2 mt-2 text-red-600">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p className="text-sm">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    </div>
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
                  className={`mt-2 ${
                    field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : ''
                  }`}
                />
                {field.state.meta.errors.length > 0 &&
                  field.state.meta.isTouched && (
                    <div className="flex items-start gap-2 mt-2 text-red-600">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p className="text-sm">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    </div>
                  )}
              </div>
            )}
          </form.Field>

          {/* Birthday */}
          <form.Field
            name="birthday"
            validators={{
              onChange: ({ value }) => {
                const result =
                  CreateContactSchema.shape.birthday.safeParse(value)
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message
              },
            }}
          >
            {(field) => (
              <div>
                <Label
                  htmlFor="birthday"
                  className="text-sm font-medium text-gray-900"
                >
                  Cumpleaños *
                </Label>
                <Input
                  id="birthday"
                  type="date"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={`mt-2 ${
                    field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : ''
                  }`}
                />
                {field.state.meta.errors.length > 0 &&
                  field.state.meta.isTouched && (
                    <div className="flex items-start gap-2 mt-2 text-red-600">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p className="text-sm">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    </div>
                  )}
              </div>
            )}
          </form.Field>

          {/* Personality Tags */}
          <form.Field
            name="personalityTags"
            validators={{
              onChange: ({ value }) => {
                const result =
                  CreateContactSchema.shape.personalityTags.safeParse(value)
                return result.success
                  ? undefined
                  : result.error.issues[0]?.message
              },
            }}
          >
            {(field) => {
              const addTag = (tag: string) => {
                const trimmedTag = tag.trim()
                if (trimmedTag && !field.state.value.includes(trimmedTag)) {
                  field.handleChange([...field.state.value, trimmedTag])
                }
                setTagInputValue('')
              }

              const removeTag = (tagToRemove: string) => {
                field.handleChange(
                  field.state.value.filter((tag) => tag !== tagToRemove),
                )
              }

              const handleKeyDown = (
                e: React.KeyboardEvent<HTMLInputElement>,
              ) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag(tagInputValue)
                }
              }

              return (
                <div>
                  <Label
                    htmlFor="personalityTags"
                    className="text-sm font-medium text-gray-900"
                  >
                    Etiquetas de Personalidad *
                  </Label>

                  {/* Display tags */}
                  {field.state.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 mb-2">
                      {field.state.value.map((tag, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm text-gray-700"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-red-400 hover:text-red-600 transition-colors"
                            aria-label={`Eliminar ${tag}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Input for new tags */}
                  <Input
                    id="personalityTags"
                    value={tagInputValue}
                    onChange={(e) => setTagInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                      if (tagInputValue.trim()) {
                        addTag(tagInputValue)
                      }
                    }}
                    placeholder="Escribe una etiqueta y presiona Enter"
                    className={`mt-2 ${
                      field.state.meta.errors.length > 0 &&
                      field.state.meta.isTouched
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : ''
                    }`}
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    Presiona{' '}
                    <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-gray-100 border border-gray-300 rounded">
                      Enter
                    </kbd>{' '}
                    para agregar cada etiqueta
                  </p>

                  {field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched && (
                      <div className="flex items-start gap-2 mt-2 text-red-600">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p className="text-sm">
                          {field.state.meta.errors.join(', ')}
                        </p>
                      </div>
                    )}
                </div>
              )
            }}
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
                  className={`mt-2 ${
                    field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : ''
                  }`}
                />
                {field.state.meta.errors.length > 0 &&
                  field.state.meta.isTouched && (
                    <div className="flex items-start gap-2 mt-2 text-red-600">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p className="text-sm">
                        {field.state.meta.errors.join(', ')}
                      </p>
                    </div>
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
              selector={(fState) => ({ isSubmitting: fState.isSubmitting })}
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
