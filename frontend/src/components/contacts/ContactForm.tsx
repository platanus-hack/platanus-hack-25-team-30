import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import * as ShadcnSelect from '@/components/ui/select'
import { useForm } from '@tanstack/react-form'
import { CreateContactSchema, type CreateContactData } from '@/lib/schemas/contact-schema'
import { X } from 'lucide-react'
import { useContacts } from '@/hooks/contact-hook'

interface ContactFormProps {
  onClose: () => void
}

export function ContactForm({ onClose }: ContactFormProps) {
  const { createContact, isCreating } = useContacts()

  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      relationshipType: 'Familia' as const,
      email: '',
      phone: '',
      birthday: '',
      personalityTags: [] as string[],
      notes: '',
    },
    onSubmit: async ({ value }) => {
      const result = CreateContactSchema.safeParse(value)
      if (!result.success) {
        console.error('Validation failed:', result.error)
        return
      }
      createContact(result.data, {
        onSuccess: () => {
          onClose()
        }
      })
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
            <h2 className="text-2xl font-semibold text-gray-900">Agregar Nuevo Contacto</h2>
            <p className="text-sm text-gray-600 mt-1">
              Agrega una nueva persona para hacer seguimiento a tu relación con ella
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
          {/* Name Field */}
          <form.Field name="firstName">
            {(field) => (
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-900">
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
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-900">
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
                <Label htmlFor="relationshipType" className="text-sm font-medium text-gray-900">
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
                      <ShadcnSelect.SelectItem key={type.value} value={type.value}>
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
                <Label htmlFor="email" className="text-sm font-medium text-gray-900">
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
                <Label htmlFor="phone" className="text-sm font-medium text-gray-900">
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
                <Label htmlFor="birthday" className="text-sm font-medium text-gray-900">
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
                <Label htmlFor="personalityTags" className="text-sm font-medium text-gray-900">
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
                <Label htmlFor="notes" className="text-sm font-medium text-gray-900">
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
            <form.Subscribe selector={(state) => ({ isSubmitting: state.isSubmitting })}>
              {({ isSubmitting }) => (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-400 hover:bg-red-500 text-white"
                >
                  Agregar Contacto
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </div>
  )
}
