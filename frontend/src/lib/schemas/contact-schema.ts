import { z } from 'zod'

export const CreateContactSchema = z.object({
  avatar: z.instanceof(File).optional(),
  firstName: z.string().min(1, { message: 'El nombre es requerido' }),
  lastName: z.string().min(1, { message: 'El apellido es requerido' }),
  relationshipType: z.enum(
    ['Familia', 'Amigo Cercano', 'Amigo', 'Colega', 'Romantico', 'Conocido'],
    { message: 'Selecciona un tipo de relación' },
  ),
  email: z
    .string()
    .transform((val) => val === '' ? undefined : val)
    .pipe(z.email({ message: 'Email inválido' }).optional()),
  phone: z.string().optional(),
  birthday: z.iso.date({ message: 'Fecha de cumpleaños inválida' }),
  personalityTags: z
    .array(z.string())
    .max(5, { message: 'Máximo 5 etiquetas de personalidad' })
    .min(1, { message: 'Al menos una etiqueta de personalidad es requerida' }),
  notes: z.string().optional(),
})

export type CreateContactData = z.infer<typeof CreateContactSchema>
